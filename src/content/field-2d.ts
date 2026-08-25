import { FUCHSIA, INDIGO, VIOLET } from './chroma';
import { DENSITY, LIFT_CEILING, type FieldState } from './field-state';
import type { FieldRenderer } from './field-gl';

/* --------------------------------------------------------------------------
 * Hero field, drawn on the CPU.
 *
 * The fallback for anything without WebGL, and the only path used under
 * reduced motion, where it paints one static frame. It runs a coarser grid
 * than the shader because every lit cell here is a fillRect on the main
 * thread, and the main thread also has scrolling to do.
 *
 * Which cells are lit is stored rather than hashed: a row is re-rolled only
 * when the simulation hands it a new seed, so the common frame costs nothing
 * but the drawing.
 * ------------------------------------------------------------------------ */

export const CPU_PITCH = 5;
const CPU_DOT = 3;
/** Channel separation, in px, at full split. Matches the shader. */
const CHANNEL = 3;

export function createCpuRenderer(canvas: HTMLCanvasElement): FieldRenderer | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  let cols = 0;
  let rows = 0;
  let width = 0;
  let height = 0;
  let lit = new Uint8Array(0);
  let rolled = new Float32Array(0);

  const rollRow = (y: number): void => {
    const base = y * cols;
    for (let x = 0; x < cols; x += 1) {
      lit[base + x] = Math.random() < DENSITY ? 1 : 0;
    }
  };

  return {
    pitch: CPU_PITCH,
    // Every lit cell here is a fillRect on the main thread, which also has
    // scrolling to do. This path stays at 30fps and the simulation makes up
    // the difference in its own time base.
    frameMs: 33,

    resize(nextWidth: number, nextHeight: number, dpr: number): void {
      width = nextWidth;
      height = nextHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.ceil(width / CPU_PITCH));
      rows = Math.max(1, Math.ceil(height / CPU_PITCH));
      lit = new Uint8Array(cols * rows);
      // A seed of -1 matches nothing, so every row rolls on the first draw.
      rolled = new Float32Array(rows).fill(-1);
    },

    draw(state: FieldState): void {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const limit = Math.min(rows, state.rows);

      for (let y = 0; y < limit; y += 1) {
        if (rolled[y] !== state.seed[y]) {
          rolled[y] = state.seed[y];
          rollRow(y);
        }

        const shift = state.slip[y];
        const chroma = state.split[y];
        const boost = state.lift[y];
        const py = y * CPU_PITCH;
        // Normalised distance from the middle, squared so the clear area in
        // the centre is generous and the texture gathers at the edges.
        const dy = (py - cy) / cy;
        const base = y * cols;

        for (let x = 0; x < cols; x += 1) {
          if (lit[base + x] === 0) continue;

          const px = x * CPU_PITCH;
          const dx = (px - cx) / cx;
          /*
           * Rows the pointer is dragging light up through the cleared centre,
           * capped well under the density of the frame and gone within a
           * second. The clear middle is a statement about the resting state,
           * not a no-go area: a smear you cut across the headline yourself,
           * which then heals, is worth more than a rule kept perfectly.
           * Spontaneous tears get no such lift, so nothing flickers under the
           * type unprompted.
           */
          const falloff = Math.max(
            Math.min(1, dx * dx + dy * dy),
            boost * LIFT_CEILING,
          );
          if (falloff < 0.04) continue;

          if (chroma > 0.05) {
            const edge = (chroma * 0.5 * falloff).toFixed(3);
            ctx.fillStyle = `rgba(${FUCHSIA}, ${edge})`;
            ctx.fillRect(px + shift - CHANNEL, py, CPU_DOT, CPU_DOT);
            ctx.fillStyle = `rgba(${INDIGO}, ${edge})`;
            ctx.fillRect(px + shift + CHANNEL, py, CPU_DOT, CPU_DOT);
          }

          ctx.fillStyle = `rgba(${VIOLET}, ${(0.34 * falloff).toFixed(3)})`;
          ctx.fillRect(px + shift, py, CPU_DOT, CPU_DOT);
        }
      }
    },

    destroy(): void {
      lit = new Uint8Array(0);
      rolled = new Float32Array(0);
    },
  };
}
