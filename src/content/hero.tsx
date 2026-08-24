import { motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import { useCallback } from 'react';
import { FUCHSIA, INDIGO } from './chroma';
import { HeroField } from './hero-field';
import { EASE } from './motion';
import { PendingField } from './pending-field';
import { Eyebrow } from './primitives';

const CONFIRMED_ROWS = [
  {
    field: 'Where',
    value: 'University of Virginia, Charlottesville VA',
  },
  {
    field: 'Length',
    value: '24 hours',
  },
  {
    field: 'Cost',
    value: '$0. Food, workshops, and swag are covered.',
  },
  {
    field: 'Who',
    value: 'Any student, any major. No coding experience needed.',
  },
];

const PENDING_ROWS = [
  { field: 'Dates', phase: 0 },
  { field: 'Theme', phase: 0.45 },
];

/*
 * The wordmark asset already carries a baked chroma fringe. This pulls the
 * same two channels apart on arrival and closes them back up. Hard offsets at
 * zero blur radius, so they read as displaced copies rather than glows.
 */
const SPLIT_OPEN = `drop-shadow(-6px 0 0 rgba(${FUCHSIA}, 0.55)) drop-shadow(6px 0 0 rgba(${INDIGO}, 0.55))`;
const SPLIT_SETTLED = `drop-shadow(0px 0 0 rgba(${FUCHSIA}, 0)) drop-shadow(0px 0 0 rgba(${INDIGO}, 0))`;


export function Hero(): React.JSX.Element {
  const reduceMotion = useReducedMotion();
  const counter = useAnimationControls();

  const step = (index: number) => ({
    animate: { opacity: 1, y: 0 },
    initial: { opacity: 0, y: reduceMotion ? 0 : 16 },
    transition: {
      duration: reduceMotion ? 0.3 : 0.6,
      delay: 0.06 * index,
      ease: EASE,
    },
  });

  /*
   * The card lands first, then its rows fill in top to bottom like a readout.
   * The two pending rows are last, so the table is seen to fill in and then
   * stop short, which is the whole point the counter is making.
   */
  const row = (index: number) => ({
    animate: { opacity: 1, x: 0 },
    initial: { opacity: 0, x: reduceMotion ? 0 : -6 },
    transition: {
      duration: 0.34,
      delay: 0.34 + (reduceMotion ? 0.04 : 0.06) * index,
      ease: EASE,
    },
  });

  // Each read-out pass dips the counter. The two fields run out of phase, so
  // it breathes irregularly instead of ticking.
  const pulseCounter = useCallback(() => {
    if (reduceMotion) return;
    void counter.start({
      opacity: [1, 0.55, 1],
      transition: { duration: 0.26, ease: EASE },
    });
  }, [counter, reduceMotion]);

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <HeroField />
      </div>

      <div className="shell pt-14 pb-20 md:pt-20 md:pb-28">
        <motion.div {...step(0)}>
          <Eyebrow>2027 &middot; University of Virginia</Eyebrow>
        </motion.div>

        <motion.img
          alt="HooHacks"
          animate={{
            opacity: 1,
            y: 0,
            filter: reduceMotion ? 'none' : SPLIT_SETTLED,
          }}
          className="mt-8 w-full max-w-[20rem] md:max-w-[30rem]"
          height={148}
          initial={{
            opacity: 0,
            y: reduceMotion ? 0 : 16,
            filter: reduceMotion ? 'none' : SPLIT_OPEN,
          }}
          src="/big-logo.png"
          transition={{
            duration: reduceMotion ? 0.3 : 0.6,
            delay: 0.06,
            ease: EASE,
            filter: { type: 'spring', bounce: 0, duration: 0.55, delay: 0.1 },
          }}
          width={828}
        />

        <motion.h1
          className="t-display mt-9 max-w-[16ch] text-[clamp(2.25rem,5.5vw,4rem)] text-chalk"
          {...step(2)}
        >
            Virginia’s largest hackathon returns in 2027
        </motion.h1>

        <div className="mt-10 flex flex-col gap-9 md:flex-row md:items-end md:justify-between md:gap-16">
          <motion.p className="t-lead max-w-[52ch] text-haze" {...step(3)}>
            24 hours of building at UVA, free for every student and open to
            any major. The dates and the theme have not been announced yet.
            Join the mailing list to be notified when they are announced.
          </motion.p>

          <motion.div className="flex flex-wrap gap-3" {...step(4)}>
            <a className="btn btn-primary" href="#notify">
              Get notified
            </a>
            <a className="btn btn-quiet" href="#about">
              What is HooHacks?
            </a>
          </motion.div>
        </div>

        <motion.div
          className="mt-14 rounded-[2px] border border-rule bg-slab md:mt-20"
          {...step(5)}
        >
          <div className="flex items-center justify-between gap-4 border-b border-rule px-5 py-3.5 md:px-7">
            <p className="t-label whitespace-nowrap text-haze">
              Event details
            </p>
            <motion.p
              animate={counter}
              className="t-label whitespace-nowrap text-primary"
            >
              2 fields pending
            </motion.p>
          </div>

          <dl className="px-5 md:px-7">
            {CONFIRMED_ROWS.map((entry, index) => (
              <motion.div
                className="flex flex-col gap-1 border-b border-rule/60 py-4 md:flex-row md:items-baseline md:gap-8 md:py-[1.15rem]"
                key={entry.field}
                {...row(index)}
              >
                <dt className="t-label shrink-0 text-slate md:w-24">
                  {entry.field}
                </dt>
                <dd className="t-body text-[0.9375rem] text-chalk md:text-base">
                  {entry.value}
                </dd>
              </motion.div>
            ))}

            {PENDING_ROWS.map((entry, index) => (
              <motion.div
                className={`flex flex-col gap-2.5 py-4 md:flex-row md:items-center md:gap-8 md:py-[1.15rem] ${
                  index === PENDING_ROWS.length - 1
                    ? ''
                    : 'border-b border-rule/60'
                }`}
                key={entry.field}
                {...row(CONFIRMED_ROWS.length + index)}
              >
                <dt className="t-label shrink-0 text-primary md:w-24">
                  {entry.field}
                </dt>
                <dd className="flex flex-1 items-center gap-5 overflow-hidden">
                  <PendingField onSweep={pulseCounter} phase={entry.phase} />
                  <span className="t-label shrink-0 text-primary">
                    Pending
                  </span>
                </dd>
              </motion.div>
            ))}
          </dl>
        </motion.div>
      </div>
    </section>
  );
}

