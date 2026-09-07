import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';
// Applications are closed. Uncomment with the Apply row below when they reopen.
// import { APPLY_URL } from '../apply-link';
import { NAV_LINKS } from './nav-links';

/*
 * The sheet grows out of the button that opened it and collapses back into
 * it, so the panel and its trigger stay spatially related. Everything is
 * spring-driven rather than keyframed, which is what lets a close tap during
 * the opening animation reverse from wherever the panel currently is instead
 * of waiting for the open to finish.
 */

const SHEET_IN = { type: 'spring', bounce: 0, duration: 0.34 } as const;
const SHEET_OUT = { type: 'spring', bounce: 0, duration: 0.24 } as const;

export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}): React.JSX.Element {
  const reduceMotion = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    // Remember what had focus so closing hands it straight back, rather than
    // dropping the caret at the top of the document.
    returnFocusTo.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };
    // The sheet only exists below the sm breakpoint; crossing it while open
    // would hide the panel and leave the page scroll-locked behind it.
    const wide = window.matchMedia('(min-width: 640px)');
    const onWide = (): void => {
      if (wide.matches) onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    wide.addEventListener('change', onWide);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      wide.removeEventListener('change', onWide);
      returnFocusTo.current?.focus();
    };
  }, [open, onClose]);

  const sheet = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0, transition: { duration: 0.14 } },
        transition: { duration: 0.18 },
      }
    : {
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.96, transition: SHEET_OUT },
        transition: SHEET_IN,
      };

  // Rows arrive a beat apart, travelling the same direction the sheet is
  // expanding, so the motion points at where the list is going to land.
  const row = (index: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: -10 },
          animate: { opacity: 1, y: 0 },
          transition: {
            type: 'spring' as const,
            bounce: 0,
            duration: 0.42,
            delay: 0.04 + index * 0.035,
          },
        };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="material fixed inset-0 z-50 origin-top-right sm:hidden"
          id="mobile-menu"
          {...sheet}
        >
          <div className="shell flex h-16 items-center border-b border-rule">
            <a
              aria-label="HooHacks home"
              className="flex items-center"
              href="/"
              onClick={onClose}
            >
              <img alt="" aria-hidden height="30" src="/logo.svg" width="35" />
            </a>
            <button
              className="icon-btn ml-auto inline-flex size-9 items-center justify-center rounded-[2px] border border-rule text-chalk"
              onClick={onClose}
              ref={closeRef}
              type="button"
            >
              <svg
                aria-hidden
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
              <span className="sr-only">Close menu</span>
            </button>
          </div>

          <nav aria-label="Main" className="shell flex flex-col pt-8">
            {NAV_LINKS.map((link, index) => (
              <motion.a
                className="t-h2 border-b border-rule py-5 text-4xl text-chalk"
                href={link.href}
                key={link.href}
                onClick={onClose}
                {...row(index)}
              >
                {link.label}
              </motion.a>
            ))}
            <motion.a
              className="btn btn-primary mt-8"
              href="#notify"
              onClick={onClose}
              {...row(NAV_LINKS.length)}
            >
              Get notified
            </motion.a>
            {/* Uncomment when team applications reopen.
            <motion.a
              className="btn btn-quiet mt-3"
              href={APPLY_URL}
              rel="noreferrer"
              target="_blank"
              {...row(NAV_LINKS.length + 1)}
            >
              Apply to join the team
            </motion.a>
            */}
          </nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
