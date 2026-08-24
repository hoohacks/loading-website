import { motion, useReducedMotion } from 'framer-motion';

/*
 * The band is cut in and out on a stepped edge. The pattern displaces once as
 * the band arrives, in hard cuts rather than a slide: a slide reads as texture
 * scrolling past, a cut reads as a splice. Holding each keyframe until the end
 * of its segment is what removes the interpolation.
 */
const STEP_HOLD = (t: number): number => (t < 1 ? 0 : 1);

export function TornEdge({ exit = false }: { exit?: boolean }): React.JSX.Element {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden
      className="torn"
      style={{ scaleY: exit ? -1 : 1 }}
      {...(reduceMotion
        ? {}
        : {
            transition: {
              duration: 0.36,
              ease: [STEP_HOLD, STEP_HOLD, STEP_HOLD],
            },
            viewport: { once: true, margin: '-40px' },
            whileInView: {
              backgroundPositionX: ['0px', '-37px', '14px', '0px'],
            },
          })}
    />
  );
}

