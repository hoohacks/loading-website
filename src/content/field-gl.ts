import { FUCHSIA, INDIGO, VIOLET } from './chroma';
import { DENSITY, LIFT_CEILING, MAX_SLIP, type FieldState } from './field-state';

/* --------------------------------------------------------------------------
 * Hero field, drawn on the GPU.
 *
 * The whole field is one fullscreen fragment shader. There is no per-cell
 * geometry and no per-cell work on the CPU: a pixel works out which grid cell
 * it belongs to, hashes that cell to decide whether it is lit, and reads its
 * row's displacement from a texture that is one pixel tall and one pixel per
 * row wide. Uploading that texture is the only per-frame cost, which is why
 * this path can run a grid three times denser than the fallback while leaving
 * the main thread free for scrolling.
 *
 * The hash here and the lookup table in the 2D fallback are different noise
 * sources with the same statistics. They never run at the same time, so they
 * only have to agree on character, not on individual cells.
 * ------------------------------------------------------------------------ */

/** Finer than the fallback, because the GPU does not care. */
export const GL_PITCH = 3;
const GL_DOT = 2;
/** Channel separation, in px, at full split. Matches the fallback. */
const CHANNEL = 3;

const VERTEX_SHADER = `
attribute vec2 aCorner;
void main() {
  gl_Position = vec4(aCorner, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uSize;        // canvas size in CSS px
uniform float uDpr;
uniform float uRows;
uniform float uPitch;
uniform float uDot;
uniform float uDensity;
uniform float uMaxSlip;
uniform float uLiftCeiling;
uniform float uChannel;
uniform sampler2D uRowState;
uniform vec3 uFuchsia;
uniform vec3 uIndigo;
uniform vec3 uViolet;

float hash(float column, float row, float seed) {
  return fract(sin(column * 127.1 + row * 311.7 + seed * 758.5) * 43758.5453);
}

/*
 * Is this pixel inside a lit dot, and how strongly should it read? x is the
 * pixel's horizontal position already un-shifted by the row's slip. Returns
 * the falloff, or zero for nothing here. Falloff is taken from the cell the
 * dot belongs to, not from the pixel, so a displaced row keeps the density it
 * had where it came from.
 */
float cell(float x, float rowY, float row, float seed, float lift) {
  float column = floor(x / uPitch);
  if (x - column * uPitch >= uDot) return 0.0;
  if (hash(column, row, seed) >= uDensity) return 0.0;

  vec2 mid = uSize * 0.5;
  float dx = (column * uPitch - mid.x) / mid.x;
  float dy = (rowY - mid.y) / mid.y;

  // Rows the pointer is dragging light through the cleared centre, capped
  // well under the density of the frame and gone within a second.
  float falloff = max(min(1.0, dx * dx + dy * dy), lift * uLiftCeiling);
  return falloff < 0.04 ? 0.0 : falloff;
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uSize.y * uDpr - gl_FragCoord.y) / uDpr;

  float row = floor(p.y / uPitch);
  if (row >= uRows) discard;
  float rowY = row * uPitch;
  if (p.y - rowY >= uDot) discard;

  vec4 state = texture2D(uRowState, vec2((row + 0.5) / uRows, 0.5));
  float slip = (state.r - 0.5) * 2.0 * uMaxSlip;
  float split = state.g;
  float lift = state.b;
  float seed = state.a;

  float x = p.x - slip;

  // Composited in the order the fallback paints them: the two channels first,
  // the violet dot over the top.
  vec4 acc = vec4(0.0);

  if (split > 0.05) {
    float edge = split * 0.5;
    float f = cell(x + uChannel, rowY, row, seed, lift) * edge;
    acc = vec4(uFuchsia * f, f) + acc * (1.0 - f);
    float i = cell(x - uChannel, rowY, row, seed, lift) * edge;
    acc = vec4(uIndigo * i, i) + acc * (1.0 - i);
  }

  float v = cell(x, rowY, row, seed, lift) * 0.34;
  acc = vec4(uViolet * v, v) + acc * (1.0 - v);

  if (acc.a <= 0.0) discard;
  gl_FragColor = acc;
}
`;

function rgb(triple: string): [number, number, number] {
  const [r, g, b] = triple.split(',').map((part) => Number(part.trim()) / 255);
  return [r, g, b];
}

function compile(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export interface FieldRenderer {
  readonly pitch: number;
  /**
   * Shortest gap between painted frames, in ms. The drag is direct
   * manipulation, so the shader path runs as fast as the display: at 30fps a
   * cursor-driven effect reads as lag, which is exactly what it is.
   */
  readonly frameMs: number;
  resize(width: number, height: number, dpr: number): void;
  draw(state: FieldState): void;
  destroy(): void;
}

/**
 * Whether the shader path will work, decided on a throwaway canvas.
 *
 * This exists because a canvas keeps the first context type it is ever given.
 * Asking the real canvas for WebGL and only then discovering the program will
 * not link would leave it unable to supply a 2D context, and the fallback
 * would have nowhere to draw. One extra compile at startup buys a fallback
 * that actually works.
 */
export function supportsGl(): boolean {
  const probe = document.createElement('canvas');
  probe.width = 1;
  probe.height = 1;
  const gl = probe.getContext('webgl');
  if (!gl) return false;

  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = vertex && fragment ? gl.createProgram() : null;
  let linked = false;

  if (vertex && fragment && program) {
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    linked = Boolean(gl.getProgramParameter(program, gl.LINK_STATUS));
    gl.deleteProgram(program);
  }
  if (vertex) gl.deleteShader(vertex);
  if (fragment) gl.deleteShader(fragment);
  gl.getExtension('WEBGL_lose_context')?.loseContext();

  return linked;
}

/**
 * Returns null when WebGL is unavailable or the program will not build, which
 * is the caller's signal to fall back rather than to show nothing.
 */
export function createGlRenderer(
  canvas: HTMLCanvasElement,
): FieldRenderer | null {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: false,
    premultipliedAlpha: true,
    stencil: false,
  });
  if (!gl) return null;

  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = vertex && fragment ? gl.createProgram() : null;
  if (!vertex || !fragment || !program) return null;

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  // One triangle covering the viewport. Cheaper than a quad and there is no
  // seam down the diagonal.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const corner = gl.getAttribLocation(program, 'aCorner');
  gl.enableVertexAttribArray(corner);
  gl.vertexAttribPointer(corner, 2, gl.FLOAT, false, 0, 0);

  const at = (name: string): WebGLUniformLocation | null =>
    gl.getUniformLocation(program, name);

  const uSize = at('uSize');
  const uDpr = at('uDpr');
  const uRows = at('uRows');

  gl.uniform1f(at('uPitch'), GL_PITCH);
  gl.uniform1f(at('uDot'), GL_DOT);
  gl.uniform1f(at('uDensity'), DENSITY);
  gl.uniform1f(at('uMaxSlip'), MAX_SLIP);
  gl.uniform1f(at('uLiftCeiling'), LIFT_CEILING);
  gl.uniform1f(at('uChannel'), CHANNEL);
  gl.uniform3fv(at('uFuchsia'), rgb(FUCHSIA));
  gl.uniform3fv(at('uIndigo'), rgb(INDIGO));
  gl.uniform3fv(at('uViolet'), rgb(VIOLET));
  gl.uniform1i(at('uRowState'), 0);

  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  let packed = new Uint8Array(0);
  let lost = false;

  const onLost = (event: Event): void => {
    // Without preventDefault the context is never restored, and the hero would
    // keep a permanently blank canvas over it.
    event.preventDefault();
    lost = true;
  };
  const onRestored = (): void => {
    lost = false;
  };
  canvas.addEventListener('webglcontextlost', onLost);
  canvas.addEventListener('webglcontextrestored', onRestored);

  return {
    pitch: GL_PITCH,
    frameMs: 16,

    resize(width: number, height: number, dpr: number): void {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uSize, width, height);
      gl.uniform1f(uDpr, dpr);
    },

    draw(state: FieldState): void {
      if (lost) return;
      const { rows, slip, split, lift, seed } = state;
      if (packed.length !== rows * 4) packed = new Uint8Array(rows * 4);

      for (let y = 0; y < rows; y += 1) {
        const i = y * 4;
        // Slip is signed, so it is encoded around the midpoint. Eight bits
        // over the full range is a quarter of a pixel, well under a dot.
        packed[i] = (slip[y] / MAX_SLIP) * 127.5 + 127.5;
        packed[i + 1] = split[y] * 255;
        packed[i + 2] = lift[y] * 255;
        packed[i + 3] = seed[y] * 255;
      }

      gl.uniform1f(uRows, rows);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        rows,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        packed,
      );

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },

    destroy(): void {
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    },
  };
}
