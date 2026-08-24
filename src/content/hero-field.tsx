import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { FUCHSIA, INDIGO, VIOLET } from './chroma';

/* --------------------------------------------------------------------------
 * Hero backdrop.
 *
 * A sparse field of slow-drifting points behind the hero copy, using the same
 * violet as the pending fields so it reads as one system. Every few seconds a
 * thin scan line sweeps down with the fuchsia/indigo split from the wordmark
 * asset and the pending fields, then fades. Ambient, not a light show.
 * ------------------------------------------------------------------------ */


interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  base: number;
  phase: number;
}

export function HeroField(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let frame = 0;
    let scanAt = -Infinity;
    let nextScanAt = 3000 + Math.random() * 2000;

    const measure = (): void => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      if (width === 0 || height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round(
        Math.min(120, Math.max(40, (width * height) / 9000)),
      );
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.1,
        vy: 0.05 + Math.random() * 0.09,
        size: 1 + Math.round(Math.random()),
        base: 0.16 + Math.random() * 0.26,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const paintStatic = (): void => {
      ctx.fillStyle = 'rgb(10, 7, 19)';
      ctx.fillRect(0, 0, width, height);
      for (const star of stars) {
        ctx.fillStyle = `rgba(${VIOLET}, ${(star.base * 0.6).toFixed(3)})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      }
    };

    measure();

    let resume = (): void => {};
    let suspend = (): void => {};

    if (reduceMotion) {
      paintStatic();
    } else {
      const tick = (now: number): void => {
        frame = requestAnimationFrame(tick);

        // Trail fade: paint translucent ink over the previous frame instead
        // of clearing, so drifting points leave a soft streak behind them.
        ctx.fillStyle = 'rgba(10, 7, 19, 0.16)';
        ctx.fillRect(0, 0, width, height);

        const scanning = now - scanAt < 900;
        if (!scanning && now > nextScanAt) {
          scanAt = now;
          nextScanAt = now + 5200 + Math.random() * 4000;
        }

        for (const star of stars) {
          star.x += star.vx;
          star.y += star.vy;
          if (star.x < 0) star.x = width;
          if (star.x > width) star.x = 0;
          if (star.y > height) {
            star.y = 0;
            star.x = Math.random() * width;
          }

          const twinkle = Math.sin(now / 900 + star.phase) * 0.5 + 0.5;
          const alpha = star.base * (0.5 + twinkle * 0.5);
          ctx.fillStyle = `rgba(${VIOLET}, ${alpha.toFixed(3)})`;
          ctx.fillRect(star.x, star.y, star.size, star.size);
        }

        if (scanning) {
          const t = (now - scanAt) / 900;
          const y = t * (height + 40) - 20;
          const fade = Math.sin(t * Math.PI);
          ctx.fillStyle = `rgba(${FUCHSIA}, ${(fade * 0.16).toFixed(3)})`;
          ctx.fillRect(0, y - 2, width, 2);
          ctx.fillStyle = `rgba(${INDIGO}, ${(fade * 0.16).toFixed(3)})`;
          ctx.fillRect(0, y + 1, width, 2);
          ctx.fillStyle = `rgba(${VIOLET}, ${(fade * 0.1).toFixed(3)})`;
          ctx.fillRect(0, y - 1, width, 1);
        }
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

    const resize = new ResizeObserver(() => {
      measure();
      if (reduceMotion) paintStatic();
    });
    resize.observe(canvas);

    // Stop the drift once the hero has scrolled away, so the rest of the page
    // scrolls against an idle main thread.
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
  }, [reduceMotion]);

  return (
    <canvas
      aria-hidden
      className="absolute inset-0 h-full w-full bg-ink"
      ref={canvasRef}
    />
  );
}
