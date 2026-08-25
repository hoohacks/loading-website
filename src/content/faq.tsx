import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useId, useState } from 'react';
import { EASE } from './motion';
import { Eyebrow, Reveal } from './primitives';

const FAQ_ITEMS: { question: string; answer: React.ReactNode }[] = [
  {
    question: 'What happens at a hackathon?',
    answer: (
      <>
        You spend a weekend building a project with a small team, picking up
        whatever you need as you go. There are workshops, mentors, food, and
        swag throughout, and everyone demos at the end.
      </>
    ),
  },
  {
    question: 'Do I need a team?',
    answer: (
      <>
        No. Teams competing for prizes can have 1 to 4 people, and there is a
        team formation workshop before hacking starts if you arrive on your own.
      </>
    ),
  },
  {
    question: 'Who can attend?',
    answer: (
      <>
        Undergraduate, graduate, and high school students aged 18 or over.{' '}
        <strong className="font-semibold text-chalk">
          No coding experience is necessary
        </strong>
        , and non-STEM majors are welcome.
      </>
    ),
  },
  {
    question: 'What does it cost?',
    answer: (
      <>
        Nothing. There is no ticket or fee, and we cover what you need to take
        part.
      </>
    ),
  },
  {
    question: 'When will the dates be announced?',
    answer: (
      <>
        We do not have them yet. The dates, venue, and schedule go out together
        with the theme, and the mailing list gets them first.
      </>
    ),
  },
  {
    question: 'I have another question.',
    answer: (
      <>
        Email{' '}
        <a
          className="text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary"
          href="mailto:team@hoohacks.io"
        >
          team@hoohacks.io
        </a>{' '}
        and we will get back to you.
      </>
    ),
  },
];

/* --------------------------------------------------------------------------
 * FAQ disclosure.
 *
 * A native <details> snaps between two heights with nothing in between, so
 * this is a button plus a region instead. The panel springs open from
 * whatever height it currently has, which means a second tap part way through
 * reverses from there rather than finishing first. The mark is two hairlines:
 * the upright one rotates down onto the other, so the movement points at the
 * minus it is about to become.
 * ------------------------------------------------------------------------ */

const PANEL_OPEN = { type: 'spring', bounce: 0, duration: 0.34 } as const;
const PANEL_SHUT = { type: 'spring', bounce: 0, duration: 0.26 } as const;

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: React.ReactNode;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const id = useId();
  const panelId = `${id}-panel`;
  const triggerId = `${id}-trigger`;

  return (
    <div className="border-b border-rule">
      <h3>
        <button
          aria-controls={panelId}
          aria-expanded={open}
          className="faq-trigger group py-6 md:py-7"
          id={triggerId}
          onClick={() => {
            setOpen((wasOpen) => !wasOpen);
          }}
          type="button"
        >
          <span
            className={`faq-question t-h3 flex-1 text-lg transition-colors md:text-xl ${
              open ? 'text-primary' : 'text-chalk group-hover:text-primary'
            }`}
          >
            {question}
          </span>
          <span
            aria-hidden
            className="mt-2.5 grid size-3 shrink-0 place-items-center"
          >
            <span className="col-start-1 row-start-1 h-px w-3 bg-primary" />
            <motion.span
              animate={{ rotate: open ? 0 : 90 }}
              className="col-start-1 row-start-1 h-px w-3 bg-primary"
              initial={false}
              transition={reduceMotion ? { duration: 0 } : PANEL_OPEN}
            />
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            animate={{ height: 'auto', opacity: 1 }}
            aria-labelledby={triggerId}
            className="overflow-hidden"
            exit={{
              height: 0,
              opacity: 0,
              transition: reduceMotion
                ? { height: { duration: 0 }, opacity: { duration: 0.12 } }
                : { height: PANEL_SHUT, opacity: { duration: 0.12 } },
            }}
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            role="region"
            transition={
              reduceMotion
                ? { height: { duration: 0 }, opacity: { duration: 0.18 } }
                : { height: PANEL_OPEN, opacity: { duration: 0.2, delay: 0.06 } }
            }
          >
            <p className="t-body max-w-[68ch] pb-7 text-[0.9375rem] text-haze md:pb-8">
              {answer}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function Faq(): React.JSX.Element {
  return (
    <section className="shell py-20 md:py-28" id="faq">
      <Reveal>
        <Eyebrow>FAQ</Eyebrow>
        <h2 className="t-h2 mt-6 max-w-[14ch] text-[clamp(1.9rem,4.2vw,3rem)] text-chalk">
          Common questions.
        </h2>
      </Reveal>

      <div className="mt-12 border-t border-rule md:mt-16">
        {FAQ_ITEMS.map((item, index) => (
          <Reveal delay={Math.min(index, 3) * 0.05} key={item.question}>
            <FaqItem answer={item.answer} question={item.question} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

