import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { FUCHSIA, INDIGO, VIOLET } from './chroma';

/* --------------------------------------------------------------------------
 * Pending field.
 *
 * Two rows of the event table have no value yet. Both render as a pixel field
 * that never resolves: a slow read-out sweeps across lighting cells, and every
 * so often a band of rows tears sideways and splits into two colour channels
 * before snapping back. The two fields run out of phase so they do not pulse
 * in lockstep.
 * ------------------------------------------------------------------------ */

const PITCH = 6;
const DOT = 4;
const SWEEP_MS = 5200;

// How hard the read-out chases its target each painted frame. Low enough that
// the head lags a moving cursor slightly, which is what makes it read as
// dragged rather than teleported.
const CHASE = 0.18;
// Ramp on and off the pointer over roughly half a second at the 30fps paint rate.
const ENGAGE = 0.12;

export function PendingField({
  phase = 0,
  onSweep,
}: {
  phase?: number;
  onSweep?: () => void;
}): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();
  const sweepRef = useRef(onSweep);

  useEffect(() => {
    sweepRef.current = onSweep;
  }, [onSweep]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let cols = 0;
    let rows = 0;
    let seeds = new Float32Array(0);
    let tear = new Float32Array(0);
    let split = new Float32Array(0);
    let frame = 0;
    let lastPaint = 0;

    // Read-out state. `front` is where the head is actually painted; it chases
    // a target that is the free-running cycle until a pointer takes it over.
    let front = -0.2;
    let lastCycle = 0;
    let pointerU = 0.5;
    let wanted = 0;
    let engagement = 0;

    const measure = (): void => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width === 0 || height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.floor(width / PITCH));
      rows = Math.max(1, Math.floor(height / PITCH));
      seeds = new Float32Array(cols * rows);
      tear = new Float32Array(rows);
      split = new Float32Array(rows);
      for (let i = 0; i < seeds.length; i += 1) seeds[i] = Math.random();
    };

    // `at` is where the read-out currently sits, in 0..1 column space.
    const paint = (at: number): void => {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      for (let y = 0; y < rows; y += 1) {
        const shift = tear[y];
        const chroma = split[y];
        for (let x = 0; x < cols; x += 1) {
          const seed = seeds[y * cols + x];
          const u = cols > 1 ? x / (cols - 1) : 0;
          const heat = Math.max(0, 1 - Math.abs(u - at) / 0.13);
          if (seed > 0.44 + heat * 0.46) continue;

          const px = x * PITCH + shift;
          const py = y * PITCH;

          if (chroma > 0.04) {
            const edge = (chroma * 0.5).toFixed(3);
            ctx.fillStyle = `rgba(${FUCHSIA}, ${edge})`;
            ctx.fillRect(px - 3, py, DOT, DOT);
            ctx.fillStyle = `rgba(${INDIGO}, ${edge})`;
            ctx.fillRect(px + 3, py, DOT, DOT);
          }

          ctx.fillStyle =
            heat > 0 && seed < heat * 0.6
              ? `rgba(199, 185, 255, ${(0.4 + 0.6 * heat).toFixed(3)})`
              : `rgba(${VIOLET}, ${(0.42 + seed * 0.5).toFixed(3)})`;
          ctx.fillRect(px, py, DOT, DOT);
        }
      }
    };

    measure();

    // The field runs only while it is on screen. A canvas repainting behind
    // the fold competes with scrolling for frames and buys nothing.
    let resume = (): void => {};
    let suspend = (): void => {};

    if (reduceMotion) {
      paint(-1);
    } else {
      const tick = (now: number): void => {
        frame = requestAnimationFrame(tick);
        if (now - lastPaint < 33) return;
        lastPaint = now;

        // A few cells re-noise each frame so the texture never settles.
        for (let i = 0; i < 4; i += 1) {
          seeds[Math.floor(Math.random() * seeds.length)] = Math.random();
        }

        for (let y = 0; y < rows; y += 1) {
          tear[y] *= 0.78;
          split[y] *= 0.84;
        }

        engagement += (wanted - engagement) * ENGAGE;

        // Tearing gets more frequent the more the field is being handled.
        if (Math.random() < 0.07 + engagement * 0.09) {
          const start = Math.floor(Math.random() * rows);
          const depth = 1 + Math.floor(Math.random() * 2);
          const offset = (Math.random() * 2 - 1) * 16;
          for (let y = start; y < Math.min(rows, start + depth); y += 1) {
            tear[y] = offset;
            split[y] = 0.55 + Math.random() * 0.45;
          }
        }

        // The free cycle overshoots both edges, so there is a beat of pure
        // noise between passes. A pointer pulls the target off it and onto
        // the cursor, in proportion to how engaged the field currently is.
        const cycle = (now / SWEEP_MS + phase) % 1;
        const free = cycle * 1.4 - 0.2;
        const target = free + (pointerU - free) * engagement;

        if (cycle < lastCycle) {
          // The cycle has restarted off the left edge. Snap rather than
          // chase, or the head would sweep visibly backwards across the field.
          front = target;
          sweepRef.current?.();
        } else {
          front += (target - front) * CHASE;
        }
        lastCycle = cycle;

        paint(front);
      };
      let running = false;
      resume = (): void => {
        if (running) return;
        running = true;
        frame = requestAnimationFrame(tick);
      };
      suspend = (): void => {
        running = false;
        cancelAnimationFrame(frame);
      };
    }

    // Only a real pointer drives the read-out. On touch there is no hover to
    // express, and the field would just lurch on tap.
    const fine =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const onMove = (event: PointerEvent): void => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0) return;
      pointerU = Math.min(
        1,
        Math.max(0, (event.clientX - rect.left) / rect.width),
      );
      wanted = 1;
    };
    const onLeave = (): void => {
      wanted = 0;
    };

    if (fine && !reduceMotion) {
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerleave', onLeave);
      canvas.addEventListener('pointercancel', onLeave);
    }

    const resize = new ResizeObserver(() => {
      measure();
      if (reduceMotion) paint(-1);
    });
    resize.observe(canvas);

    const onScreen = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) resume();
      else suspend();
    });
    onScreen.observe(canvas);

    return () => {
      suspend();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointercancel', onLeave);
      resize.disconnect();
      onScreen.disconnect();
    };
  }, [phase, reduceMotion]);

  return (
    <canvas
      aria-hidden
      className="h-[30px] min-w-0 flex-1 md:h-[34px]"
      ref={canvasRef}
    />
  );
}
