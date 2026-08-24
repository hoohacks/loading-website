import { motion, useReducedMotion } from 'framer-motion';
import React, { useEffect, useRef } from 'react';
import ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';

/* --------------------------------------------------------------------------
 * Pending field.
 *
 * Two rows of the event table have no value yet. Both render as a pixel field
 * that never resolves: a slow read-out sweeps across lighting cells, and every
 * so often a band of rows tears sideways and splits into two colour channels
 * before snapping back. The two fields run out of phase so they do not pulse
 * in lockstep.
 * ------------------------------------------------------------------------ */

const PITCH = 6;
const DOT = 4;
const SWEEP_MS = 5200;

function PendingField({ phase = 0 }: { phase?: number }): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let cols = 0;
    let rows = 0;
    let seeds = new Float32Array(0);
    let tear = new Float32Array(0);
    let split = new Float32Array(0);
    let frame = 0;
    let lastPaint = 0;

    const measure = (): void => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width === 0 || height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.floor(width / PITCH));
      rows = Math.max(1, Math.floor(height / PITCH));
      seeds = new Float32Array(cols * rows);
      tear = new Float32Array(rows);
      split = new Float32Array(rows);
      for (let i = 0; i < seeds.length; i += 1) seeds[i] = Math.random();
    };

    // `front` is where the read-out currently sits, in 0..1 column space.
    const paint = (front: number): void => {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      for (let y = 0; y < rows; y += 1) {
        const shift = tear[y];
        const chroma = split[y];
        for (let x = 0; x < cols; x += 1) {
          const seed = seeds[y * cols + x];
          const u = cols > 1 ? x / (cols - 1) : 0;
          const heat = Math.max(0, 1 - Math.abs(u - front) / 0.13);
          if (seed > 0.44 + heat * 0.46) continue;

          const px = x * PITCH + shift;
          const py = y * PITCH;

          if (chroma > 0.04) {
            const edge = (chroma * 0.5).toFixed(3);
            ctx.fillStyle = `rgba(232, 121, 249, ${edge})`;
            ctx.fillRect(px - 3, py, DOT, DOT);
            ctx.fillStyle = `rgba(79, 70, 229, ${edge})`;
            ctx.fillRect(px + 3, py, DOT, DOT);
          }

          ctx.fillStyle =
            heat > 0 && seed < heat * 0.6
              ? `rgba(199, 185, 255, ${(0.4 + 0.6 * heat).toFixed(3)})`
              : `rgba(139, 92, 246, ${(0.42 + seed * 0.5).toFixed(3)})`;
          ctx.fillRect(px, py, DOT, DOT);
        }
      }
    };

    measure();

    if (reduceMotion) {
      paint(-1);
    } else {
      const tick = (now: number): void => {
        frame = requestAnimationFrame(tick);
        if (now - lastPaint < 33) return;
        lastPaint = now;

        // A few cells re-noise each frame so the texture never settles.
        for (let i = 0; i < 4; i += 1) {
          seeds[Math.floor(Math.random() * seeds.length)] = Math.random();
        }

        for (let y = 0; y < rows; y += 1) {
          tear[y] *= 0.78;
          split[y] *= 0.84;
        }

        // Occasionally tear a band of rows sideways.
        if (Math.random() < 0.07) {
          const start = Math.floor(Math.random() * rows);
          const depth = 1 + Math.floor(Math.random() * 2);
          const offset = (Math.random() * 2 - 1) * 16;
          for (let y = start; y < Math.min(rows, start + depth); y += 1) {
            tear[y] = offset;
            split[y] = 0.55 + Math.random() * 0.45;
          }
        }

        // The read-out overshoots both edges, so there is a beat of pure noise.
        const cycle = (now / SWEEP_MS + phase) % 1;
        paint(cycle * 1.4 - 0.2);
      };
      frame = requestAnimationFrame(tick);
    }

    const observer = new ResizeObserver(() => {
      measure();
      if (reduceMotion) paint(-1);
    });
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [phase, reduceMotion]);

  return (
    <canvas
      aria-hidden
      className="h-[30px] min-w-0 flex-1 md:h-[34px]"
      ref={canvasRef}
    />
  );
}

/* -------------------------------------------------------------------------- */

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

const WHAT_TO_EXPECT = [
  {
    heading: 'Build a project',
    body: 'You have 24 hours to make something and demo it at the end. Workshops run throughout, and mentors are on the floor if you get stuck.',
  },
  {
    heading: 'Meet other students',
    body: 'A few hundred students attend, along with engineers from sponsor companies. Team formation happens on site if you arrive without one.',
  },
  {
    heading: 'No experience required',
    body: 'A large share of attendees are first-time hackers or non-STEM majors. Beginners are welcome, and the workshops start from scratch.',
  },
];

const CREDENTIALS = [
  'Virginia’s largest hackathon',
  'Top 50 US collegiate hackathon',
  'Free to attend, open to any major',
];

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

/* -------------------------------------------------------------------------- */

const EASE = [0.22, 0.61, 0.36, 1] as const;

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}): React.JSX.Element {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      viewport={{ once: true, margin: '-80px' }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({
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

/* --------------------------------------------------------------------------
 * Hero backdrop.
 *
 * A sparse field of slow-drifting points behind the hero copy, using the same
 * violet as the pending fields so it reads as one system. Every few seconds a
 * thin scan line sweeps down with the fuchsia/indigo split from the wordmark
 * asset and the pending fields, then fades. Ambient, not a light show.
 * ------------------------------------------------------------------------ */

const STAR_COLOR = '139, 92, 246';
const SCAN_TOP = '232, 121, 249';
const SCAN_BOTTOM = '79, 70, 229';

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  base: number;
  phase: number;
}

function HeroField(): React.JSX.Element {
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
        ctx.fillStyle = `rgba(${STAR_COLOR}, ${(star.base * 0.6).toFixed(3)})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      }
    };

    measure();

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
          ctx.fillStyle = `rgba(${STAR_COLOR}, ${alpha.toFixed(3)})`;
          ctx.fillRect(star.x, star.y, star.size, star.size);
        }

        if (scanning) {
          const t = (now - scanAt) / 900;
          const y = t * (height + 40) - 20;
          const fade = Math.sin(t * Math.PI);
          ctx.fillStyle = `rgba(${SCAN_TOP}, ${(fade * 0.16).toFixed(3)})`;
          ctx.fillRect(0, y - 2, width, 2);
          ctx.fillStyle = `rgba(${SCAN_BOTTOM}, ${(fade * 0.16).toFixed(3)})`;
          ctx.fillRect(0, y + 1, width, 2);
          ctx.fillStyle = `rgba(${STAR_COLOR}, ${(fade * 0.1).toFixed(3)})`;
          ctx.fillRect(0, y - 1, width, 1);
        }
      };
      frame = requestAnimationFrame(tick);
    }

    const observer = new ResizeObserver(() => {
      measure();
      if (reduceMotion) paintStatic();
    });
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
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

/* -------------------------------------------------------------------------- */

function Hero(): React.JSX.Element {
  const step = (index: number) => ({
    animate: { opacity: 1, y: 0 },
    initial: { opacity: 0, y: 16 },
    transition: { duration: 0.6, delay: 0.06 * index, ease: EASE },
  });

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
          className="mt-8 w-full max-w-[20rem] md:max-w-[30rem]"
          height={148}
          src="/big-logo.png"
          width={828}
          {...step(1)}
        />

        <motion.h1
          className="t-display mt-9 max-w-[16ch] text-[clamp(2.25rem,5.5vw,4rem)] text-chalk"
          {...step(2)}
        >
            Virginia’s largest hackathon returns in 2027
        </motion.h1>

        <div className="mt-10 flex flex-col gap-9 md:flex-row md:items-end md:justify-between md:gap-16">
          <motion.p className="t-lead max-w-[52ch] text-haze" {...step(3)}>
            24 hours of building at UVA,
            free for every student and open to any major. The dates and the
            theme have not been announced yet. Leave your email and
            we&rsquo;ll let you know as soon as they are.
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
            <p className="t-label whitespace-nowrap text-primary">
              2 fields pending
            </p>
          </div>

          <dl className="px-5 md:px-7">
            {CONFIRMED_ROWS.map((row) => (
              <div
                className="flex flex-col gap-1 border-b border-rule/60 py-4 md:flex-row md:items-baseline md:gap-8 md:py-[1.15rem]"
                key={row.field}
              >
                <dt className="t-label shrink-0 text-slate md:w-24">
                  {row.field}
                </dt>
                <dd className="text-[0.9375rem] text-chalk md:text-base">
                  {row.value}
                </dd>
              </div>
            ))}

            {PENDING_ROWS.map((row, index) => (
              <div
                className={`flex flex-col gap-2.5 py-4 md:flex-row md:items-center md:gap-8 md:py-[1.15rem] ${
                  index === PENDING_ROWS.length - 1
                    ? ''
                    : 'border-b border-rule/60'
                }`}
                key={row.field}
              >
                <dt className="t-label shrink-0 text-primary md:w-24">
                  {row.field}
                </dt>
                <dd className="flex flex-1 items-center gap-5 overflow-hidden">
                  <PendingField phase={row.phase} />
                  <span className="t-label shrink-0 text-primary">
                    Pending
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>
    </section>
  );
}

function About(): React.JSX.Element {
  return (
    <section className="shell border-t border-rule py-20 md:py-28" id="about">
      <div className="grid gap-10 md:grid-cols-[5fr_7fr] md:gap-16">
        <Reveal>
          <Eyebrow>About</Eyebrow>
          <h2 className="t-h2 mt-6 text-[clamp(1.9rem,4.2vw,3rem)] text-chalk">
            A student-run hackathon, open to everyone.
          </h2>
          <img
            alt=""
            aria-hidden
            className="mt-10 w-28 mix-blend-screen md:mt-14 md:w-36"
            height={169}
            loading="lazy"
            src="/glitch-owl.gif"
            width={195}
          />
        </Reveal>

        <Reveal className="md:pt-14" delay={0.08}>
          <p className="t-lead text-haze">
            HooHacks is run by a team of students at the University of Virginia.
            We host Virginia&rsquo;s biggest hackathon each year, along with
            Ideathon, a smaller event on tech and entrepreneurship. Both are free
            and open to students from any school.
          </p>
          <ul className="mt-8">
            {CREDENTIALS.map((item) => (
              <li
                className="t-label border-t border-rule py-3.5 text-haze last:border-b"
                key={item}
              >
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <div className="mt-16 grid md:mt-20 md:grid-cols-3 md:gap-12">
        {WHAT_TO_EXPECT.map((item, index) => (
          <Reveal
            className="border-t border-rule pt-7 pb-9 md:pb-0"
            delay={index * 0.08}
            key={item.heading}
          >
            <h3 className="t-h3 text-xl text-chalk md:text-[1.375rem]">
              {item.heading}
            </h3>
            <p className="mt-3.5 text-[0.9375rem] leading-relaxed text-haze">
              {item.body}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Notify(): React.JSX.Element {
  return (
    <section id="notify">
      <div aria-hidden className="torn" />
      <div className="bg-chalk py-20 text-ink md:py-28">
        <div className="shell grid gap-12 md:grid-cols-[5fr_7fr] md:gap-16">
          <Reveal>
            <Eyebrow tone="light">Mailing list</Eyebrow>
            <h2 className="t-h2 mt-6 text-[clamp(1.9rem,4.2vw,3rem)]">
              Get the dates and theme as soon as we announce them.
            </h2>
            <p className="mt-5 text-[1.0625rem] leading-relaxed text-slate">
              We&rsquo;ll email you when the 2027 dates and theme are set, and
              when registration opens. Nothing else.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <form
              action="https://hoohacks.us17.list-manage.com/subscribe/post"
              method="POST"
              noValidate
            >
              <input name="u" type="hidden" value="8db3fa0f566f9edea113259df" />
              <input name="id" type="hidden" value="b74b5fd33d" />

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
                className="btn btn-primary mt-9 w-full sm:w-auto"
                type="submit"
              >
                Get notified
              </button>
            </form>
          </Reveal>
        </div>
      </div>
      <div aria-hidden className="torn torn--exit" />
    </section>
  );
}

function Faq(): React.JSX.Element {
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
            <details className="faq group border-b border-rule">
              <summary className="flex items-start gap-6 py-6 md:py-7">
                <h3 className="t-h3 flex-1 text-lg text-chalk transition-colors group-hover:text-primary md:text-xl">
                  {item.question}
                </h3>
                <span
                  aria-hidden
                  className="mark mt-0.5 font-mono text-lg leading-none text-primary"
                />
              </summary>
              <p className="max-w-[68ch] pb-7 text-[0.9375rem] leading-relaxed text-haze md:pb-8">
                {item.answer}
              </p>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Landing(): React.JSX.Element {
  return (
    <main>
      <Hero />
      <About />
      <Notify />
      <Faq />
    </main>
  );
}

export const { bootstrap, mount, unmount } = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: Landing,
  errorBoundary() {
    return <></>;
  },
});
