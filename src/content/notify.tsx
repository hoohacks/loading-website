import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { MAILCHIMP_ACTION, MAILCHIMP_AUDIENCE, MAILCHIMP_SINK } from './mailchimp';
import { EASE } from './motion';
import { Eyebrow, Reveal } from './primitives';
import { Resolve } from './resolve';
import { TornEdge } from './torn-edge';

/* --------------------------------------------------------------------------
 * Mailing list.
 *
 * The form posts to Mailchimp for real, but into a hidden iframe rather than
 * the current tab, so submitting does not throw the reader off the site. That
 * iframe is cross-origin: its load event tells us the post completed, not what
 * Mailchimp said about it, which is why the confirmation says the address was
 * submitted rather than claiming a subscription that has not been read back.
 *
 * Mailchimp retired the post-json JSONP endpoint for this audience (it answers
 * 404), so there is no supported way to read the result from the browser.
 * ------------------------------------------------------------------------ */

const SUBMIT_TIMEOUT_MS = 12000;
const SUBMIT_FAILED =
  'We could not complete the request. Try again, or email team@hoohacks.io.';


type SubmitState =
  | { status: 'idle' }
  | { status: 'sending' }
  | { status: 'done'; email: string }
  | { status: 'failed'; message: string };

function NotifyForm(): React.JSX.Element {
  const [state, setState] = useState<SubmitState>({ status: 'idle' });
  const reduceMotion = useReducedMotion();
  const submitted = useRef<string | null>(null);
  const sinkRef = useRef<HTMLIFrameElement>(null);

  // If the post never comes back, say so rather than sitting on "Sending".
  useEffect(() => {
    if (state.status !== 'sending') return;

    const timer = window.setTimeout(() => {
      submitted.current = null;
      setState({ status: 'failed', message: SUBMIT_FAILED });
    }, SUBMIT_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [state.status]);

  // No preventDefault: the browser performs the real post into the iframe,
  // and native validation still runs on the way.
  const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    const data = new FormData(event.currentTarget);
    const email = String(data.get('EMAIL') ?? '').trim();
    if (email === '') return;
    submitted.current = email;
    setState({ status: 'sending' });
  };

  /*
   * The post is finished when the iframe has loaded the response. That listener
   * is attached directly rather than through an onLoad prop: load does not
   * bubble, so React never delegates it down to the iframe.
   */
  useEffect(() => {
    const sink = sinkRef.current;
    if (!sink) return;

    const onLoad = (): void => {
      // The iframe also loads once, empty, when it first mounts.
      const email = submitted.current;
      if (email === null) return;
      submitted.current = null;
      setState({ status: 'done', email });
    };

    sink.addEventListener('load', onLoad);
    return () => {
      sink.removeEventListener('load', onLoad);
    };
  }, []);

  const enter = reduceMotion
    ? { duration: 0.18 }
    : ({ type: 'spring', bounce: 0, duration: 0.42 } as const);
  const leave = { duration: reduceMotion ? 0.12 : 0.18, ease: EASE };
  const lift = reduceMotion ? 0 : 10;

  return (
    <div aria-live="polite">
      <iframe
        aria-hidden
        className="hidden"
        name={MAILCHIMP_SINK}
        ref={sinkRef}
        title=""
      />

      <AnimatePresence initial={false} mode="wait">
        {state.status === 'done' ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -lift, transition: leave }}
            initial={{ opacity: 0, y: lift }}
            key="done"
            transition={enter}
          >
            <Eyebrow tone="light">Submitted</Eyebrow>
            <h3 className="t-h3 mt-6 text-2xl md:text-3xl">
              Your email address has been submitted.
            </h3>
            <p className="t-body mt-4 max-w-[46ch] text-[0.9375rem] text-slate">
              We&rsquo;ll email {state.email} when the dates and theme are
              announced, and when registration opens.
            </p>
          </motion.div>
        ) : (
          <motion.form
            action={MAILCHIMP_ACTION}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -lift, transition: leave }}
            initial={false}
            key="form"
            method="POST"
            onSubmit={onSubmit}
            target={MAILCHIMP_SINK}
            transition={enter}
          >
            <input name="u" type="hidden" value={MAILCHIMP_AUDIENCE.u} />
            <input name="id" type="hidden" value={MAILCHIMP_AUDIENCE.id} />

            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <div>
                <label className="t-label text-slate" htmlFor="FNAME">
                  First name
                </label>
                <input
                  autoComplete="given-name"
                  className="field mt-1"
                  id="FNAME"
                  name="FNAME"
                  type="text"
                />
              </div>
              <div>
                <label className="t-label text-slate" htmlFor="LNAME">
                  Last name
                </label>
                <input
                  autoComplete="family-name"
                  className="field mt-1"
                  id="LNAME"
                  name="LNAME"
                  type="text"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="t-label text-slate" htmlFor="EMAIL">
                  Email
                </label>
                <input
                  autoComplete="email"
                  className="field mt-1"
                  id="EMAIL"
                  name="EMAIL"
                  required
                  type="email"
                />
              </div>
            </div>

            <button
              className="btn btn-primary mt-9 w-full disabled:opacity-60 sm:w-auto"
              disabled={state.status === 'sending'}
              type="submit"
            >
              {state.status === 'sending' ? 'Sending' : 'Get notified'}
            </button>

            <AnimatePresence>
              {state.status === 'failed' ? (
                <motion.p
                  animate={{ opacity: 1 }}
                  className="t-body mt-4 max-w-[46ch] text-[0.9375rem] text-plum"
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: EASE }}
                >
                  {state.message}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}


export function Notify(): React.JSX.Element {
  return (
    <section id="notify">
      <TornEdge />
      <div className="bg-chalk py-20 text-ink md:py-28">
        <div className="shell grid gap-12 md:grid-cols-[5fr_7fr] md:gap-16">
          <Reveal>
            <Eyebrow tone="light">Mailing list</Eyebrow>
            <h2 className="t-h2 mt-6 text-[clamp(1.9rem,4.2vw,3rem)]">
              <Resolve>
                Get the dates and theme as soon as we announce them.
              </Resolve>
            </h2>
            <p className="t-lead mt-5 text-slate">
              We&rsquo;ll email you when the 2027 dates and theme are set, and
              when registration opens. Nothing else.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <NotifyForm />
          </Reveal>
        </div>
      </div>
      <TornEdge exit />
    </section>
  );
}

