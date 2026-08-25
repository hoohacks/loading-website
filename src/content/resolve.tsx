import { motion, useReducedMotion } from 'framer-motion';
import { FUCHSIA, INDIGO } from './chroma';

/* --------------------------------------------------------------------------
 * Resolving heading.
 *
 * A section heading arrives with its two channels pulled apart and closes
 * them, one word after the next, so the line locks in from left to right.
 *
 * This is deliberately not a character scramble. Cycling random glyphs until
 * the real letters appear is the decoding-terminal effect, which is the same
 * family as the fake terminal and the blinking cursor this page already threw
 * out, and it forces every letter into a fixed-width box to stop the line
 * reflowing. Closing the channels says the same thing (the signal arrives
 * unstable and settles) in the vocabulary the rest of the page already uses,
 * costs one text-shadow, and cannot shift the layout by a pixel.
 *
 * Split by word rather than by letter: a letter stagger long enough to see is
 * long enough to be slow, and forty spans per heading is a lot of DOM for an
 * effect that is over in less than half a second.
 * ------------------------------------------------------------------------ */

const SPLIT = `-6px 0 0 rgba(${FUCHSIA}, 0.85), 6px 0 0 rgba(${INDIGO}, 0.85)`;
const CLEAR = `0px 0 0 rgba(${FUCHSIA}, 0), 0px 0 0 rgba(${INDIGO}, 0)`;

const WORD = {
  hidden: { textShadow: SPLIT },
  shown: {
    textShadow: CLEAR,
    transition: { duration: 0.22, ease: [0.22, 0.61, 0.36, 1] as const },
  },
};

const LINE = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.03 } },
};

export function Resolve({
  children,
  className,
}: {
  children: string;
  className?: string;
}): React.JSX.Element {
  const reduceMotion = useReducedMotion();

  // Under reduced motion the heading is simply a heading. There is no gentler
  // equivalent of a channel split worth keeping.
  if (reduceMotion) {
    return <span className={className}>{children}</span>;
  }

  const words = children.split(' ');

  return (
    <motion.span
      className={className}
      initial="hidden"
      variants={LINE}
      viewport={{ once: true, margin: '-80px' }}
      whileInView="shown"
    >
      {words.map((word, index) => (
        <motion.span
          // Headings repeat words, so the index has to be part of the key.
          key={`${word}-${index}`}
          variants={WORD}
        >
          {word}
          {index < words.length - 1 ? ' ' : null}
        </motion.span>
      ))}
    </motion.span>
  );
}
