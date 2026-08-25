import { useEffect, useRef } from 'react';
import { FUCHSIA, INDIGO, VIOLET } from './chroma';

/* --------------------------------------------------------------------------
 * Hero glitch field.
 *
 * The same language as the pending rows, at full bleed. Cells sit on a fixed
 * grid and never drift: the only motion is a band of rows slipping sideways
 * and splitting into the two channels before it snaps back. That is what
 * separates this from a particle field, where the movement is the point.
 *
 * Density falls off toward the middle so the centred type sits on clean ink
 * and the texture frames it rather than running underneath it.
 * ------------------------------------------------------------------------ */

const PITCH = 5;
const DOT = 3;
/** Share of grid cells that are lit. */
const DENSITY = 0.1;
const BAND = 3;

export function HeroGlitch(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let cols = 0;
    let rows = 0;
    let lit = new Uint8Array(0);
    let slip = new Float32Array(0);
    let split = new Float32Array(0);
    let frame = 0;
    let last = 0;

    const measure = (): void => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width === 0 || height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.max(1, Math.ceil(width / PITCH));
      rows = Math.max(1, Math.ceil(height / PITCH));
      lit = new Uint8Array(cols * rows);
      slip = new Float32Array(rows);
      split = new Float32Array(rows);
      for (let i = 0; i < lit.length; i += 1) {
        lit[i] = Math.random() < DENSITY ? 1 : 0;
      }
    };

    const paint = (): void => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      for (let y = 0; y < rows; y += 1) {
        const shift = slip[y];
        const chroma = split[y];
        const py = y * PITCH;
        // Normalised distance from the middle, squared so the clear area in
        // the centre is generous and the texture gathers at the edges.
        const dy = (py - cy) / cy;

        for (let x = 0; x < cols; x += 1) {
          if (lit[y * cols + x] === 0) continue;

          const px = x * PITCH;
          const dx = (px - cx) / cx;
          const falloff = Math.min(1, dx * dx + dy * dy);
          if (falloff < 0.04) continue;

          if (chroma > 0.05) {
            const edge = (chroma * 0.5 * falloff).toFixed(3);
            ctx.fillStyle = `rgba(${FUCHSIA}, ${edge})`;
            ctx.fillRect(px + shift - 3, py, DOT, DOT);
            ctx.fillStyle = `rgba(${INDIGO}, ${edge})`;
            ctx.fillRect(px + shift + 3, py, DOT, DOT);
          }

          ctx.fillStyle = `rgba(${VIOLET}, ${(0.34 * falloff).toFixed(3)})`;
          ctx.fillRect(px + shift, py, DOT, DOT);
        }
      }
    };

    measure();

    let resume = (): void => {};
    let suspend = (): void => {};

    if (reduce) {
      paint();
    } else {
      const tick = (now: number): void => {
        frame = requestAnimationFrame(tick);
        if (now - last < 33) return;
        last = now;

        for (let y = 0; y < rows; y += 1) {
          slip[y] *= 0.74;
          split[y] *= 0.8;
        }

        // A band tears every second or so, then settles back.
        if (Math.random() < 0.04) {
          const start = Math.floor(Math.random() * rows);
          const depth = BAND + Math.floor(Math.random() * BAND);
          const offset = (Math.random() * 2 - 1) * 18;
          for (let y = start; y < Math.min(rows, start + depth); y += 1) {
            slip[y] = offset;
            split[y] = 0.6 + Math.random() * 0.4;
          }
        }

        // Every so often a band re-rolls, so the field is never quite the
        // same texture twice.
        if (Math.random() < 0.02) {
          const start = Math.floor(Math.random() * rows);
          for (let y = start; y < Math.min(rows, start + BAND); y += 1) {
            for (let x = 0; x < cols; x += 1) {
              lit[y * cols + x] = Math.random() < DENSITY ? 1 : 0;
            }
          }
        }

        paint();
      };

      let running = false;
      resume = (): void => {
        if (running) return;
        running = true;
        last = performance.now();
        frame = requestAnimationFrame(tick);
      };
      suspend = (): void => {
        running = false;
        cancelAnimationFrame(frame);
      };
    }

    const resize = new ResizeObserver(() => {
      measure();
      if (reduce) paint();
    });
    resize.observe(canvas);

    const onScreen = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) resume();
      else suspend();
    });
    onScreen.observe(canvas);

    return () => {
      suspend();
      resize.disconnect();
      onScreen.disconnect();
    };
  }, []);

  return (
    <canvas
      aria-hidden
      className="absolute inset-0 h-full w-full"
      ref={canvasRef}
    />
  );
}
