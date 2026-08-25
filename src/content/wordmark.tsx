import { motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';
import { FUCHSIA, INDIGO } from './chroma';
import { EASE } from './motion';

/* --------------------------------------------------------------------------
 * Hero wordmark.
 *
 * The asset already carries a baked chroma fringe. This pulls the same two
 * channels apart and closes them back up: once on arrival, and rarely after
 * that, so the wordmark reads as sitting on the same signal as the pending
 * rows rather than as a flat image resting on top of them. Hard offsets at
 * zero blur radius, so they are displaced copies rather than a glow.
 * ------------------------------------------------------------------------ */

const split = (offset: number, alpha: number): string =>
  `drop-shadow(${-offset}px 0 0 rgba(${FUCHSIA}, ${alpha})) drop-shadow(${offset}px 0 0 rgba(${INDIGO}, ${alpha}))`;

const SETTLED = split(0, 0);
const ARRIVING = split(7, 0.55);

/*
 * Each keyframe holds until the end of its segment, so a tear cuts between
 * positions instead of sliding through them. A slide reads as the wordmark
 * moving; a cut reads as the frame being wrong for a moment. Same trick the
 * band edges use.
 */
const CUT = (t: number): number => (t < 1 ? 0 : 1);

/* Rare enough that it is never the thing you are waiting for. */
const TEAR_MIN_MS = 8000;
const TEAR_SPREAD_MS = 7000;

export function HeroWordmark({ delay }: { delay: number }): React.JSX.Element {
  const reduceMotion = useReducedMotion();
  const channels = useAnimationControls();

  // Arrival: the split closes a beat after the wordmark has faded up, so the
  // two readings are sequential rather than muddled together.
  useEffect(() => {
    void channels.start({
      filter: SETTLED,
      transition: reduceMotion
        ? { duration: 0.24, ease: EASE }
        : { duration: 0.52, delay: delay + 0.12, ease: EASE },
    });
  }, [channels, delay, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;

    let timer = 0;
    const schedule = (): void => {
      timer = window.setTimeout(
        () => {
          // A hidden tab has been queueing these; firing on return would play
          // the backlog at once.
          if (document.visibilityState === 'visible') {
            void channels.start({
              filter: [SETTLED, split(5, 0.5), split(-4, 0.42), SETTLED],
              transform: [
                'translateX(0px)',
                'translateX(-3px)',
                'translateX(2px)',
                'translateX(0px)',
              ],
              transition: { duration: 0.17, ease: [CUT, CUT, CUT] },
            });
          }
          schedule();
        },
        TEAR_MIN_MS + Math.random() * TEAR_SPREAD_MS,
      );
    };

    schedule();
    return () => {
      window.clearTimeout(timer);
    };
  }, [channels, reduceMotion]);

  return (
    <motion.img
      alt="HooHacks"
      animate={channels}
      className="w-full"
      height={148}
      initial={{ filter: ARRIVING }}
      src="/big-logo.png"
      width={828}
    />
  );
}
