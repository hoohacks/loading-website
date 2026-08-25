import { useEffect, useRef } from 'react';
import { createCpuRenderer } from './field-2d';
import { createGlRenderer, supportsGl, type FieldRenderer } from './field-gl';
import { createPointer, createState, reseed, step } from './field-state';

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
 *
 * This file owns the wiring only. What the field does is in field-state.ts;
 * how it gets drawn is in field-gl.ts, with field-2d.ts as the fallback.
 * ------------------------------------------------------------------------ */

/**
 * A step longer than this is treated as a gap rather than a step: a tab that
 * has been asleep should resume, not fast-forward through the time it missed.
 */
const MAX_STEP_MS = 100;

export function HeroGlitch(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /*
     * Reduced motion paints one static frame, so there is nothing to gain from
     * a GPU context: take the CPU path and skip the shader compile entirely.
     *
     * Otherwise the shader path is settled on a throwaway canvas before this
     * one is touched, because a canvas keeps the first context type it is
     * given and a failed WebGL attempt would leave the fallback with nowhere
     * to draw.
     */
    const renderer: FieldRenderer | null =
      !reduce && supportsGl()
        ? createGlRenderer(canvas)
        : createCpuRenderer(canvas);
    if (!renderer) return;

    let state = createState(1, renderer.pitch);
    const pointer = createPointer();
    let rect = canvas.getBoundingClientRect();
    let frame = 0;
    let last = 0;

    const measure = (): void => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width === 0 || height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      renderer.resize(width, height, dpr);
      const rows = Math.max(1, Math.ceil(height / renderer.pitch));
      const exit = state.exit;
      state = createState(rows, renderer.pitch);
      state.exit = exit;
      rect = canvas.getBoundingClientRect();
    };

    /*
     * How far the hero has left the viewport, 0 to 1. Read once per painted
     * frame off the cached rect rather than on every scroll event, which keeps
     * scrolling free of forced layout.
     */
    const readExit = (): void => {
      rect = canvas.getBoundingClientRect();
      if (rect.height === 0) return;
      const gone = -rect.top / rect.height;
      state.exit = Math.max(0, Math.min(1, gone));
    };

    measure();

    let resume = (): void => {};
    let suspend = (): void => {};

    if (reduce) {
      renderer.draw(state);
    } else {
      const tick = (now: number): void => {
        frame = requestAnimationFrame(tick);
        const elapsed = now - last;
        if (elapsed < renderer.frameMs) return;
        last = now;

        readExit();
        step(state, pointer, rect, Math.min(elapsed, MAX_STEP_MS));
        renderer.draw(state);
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

    /*
     * The field sits under a pointer-events-none wrapper, so it can never be
     * the target of a pointer event itself. The listener goes on the window
     * and the hit test runs against the canvas box, which also means the copy
     * sitting on top of the field does not block the drag.
     */
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const onMove = (event: PointerEvent): void => {
      if (event.pointerType !== 'mouse') return;
      // Re-entering after a gap must not read as one huge frame of travel.
      if (!pointer.inside) pointer.previousX = event.clientX;
      pointer.clientX = event.clientX;
      pointer.clientY = event.clientY;
      pointer.inside = true;
    };
    const onOut = (): void => {
      pointer.inside = false;
    };

    /*
     * Coming back to the tab re-rolls every row at once, so the field you left
     * is not the field you return to. Nothing announces it. It is only there
     * so that a page left open all afternoon does not read as a frozen image
     * the moment you look at it again.
     */
    const onVisibility = (): void => {
      if (document.visibilityState !== 'visible') return;
      reseed(state);
      pointer.previousX = pointer.clientX;
      last = performance.now();
    };

    if (fine && !reduce) {
      window.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerleave', onOut);
    }
    if (!reduce) {
      document.addEventListener('visibilitychange', onVisibility);
    }

    const resize = new ResizeObserver(() => {
      measure();
      if (reduce) renderer.draw(state);
    });
    resize.observe(canvas);

    const onScreen = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) resume();
      else suspend();
    });
    onScreen.observe(canvas);

    return () => {
      suspend();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onOut);
      document.removeEventListener('visibilitychange', onVisibility);
      resize.disconnect();
      onScreen.disconnect();
      renderer.destroy();
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
