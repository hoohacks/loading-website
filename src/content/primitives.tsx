import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from './motion';

/*
 * The two wrappers every section is built out of: a scroll-in reveal and
 * the ruled label above each heading.
 */

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}): React.JSX.Element {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
      transition={{ duration: reduceMotion ? 0.3 : 0.5, delay, ease: EASE }}
      viewport={{ once: true, margin: '-80px' }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}

export function Eyebrow({
  children,
  tone = 'dark',
}: {
  children: React.ReactNode;
  tone?: 'dark' | 'light';
}): React.JSX.Element {
  return (
    <p
      className={`t-label flex items-center gap-2.5 ${
        tone === 'dark' ? 'text-haze' : 'text-slate'
      }`}
    >
      <span aria-hidden className="inline-block h-px w-6 bg-primary" />
      {children}
    </p>
  );
}
