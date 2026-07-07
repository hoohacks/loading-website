import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';

const TERMINAL_LINES = [
  { prompt: '$', text: ' hoohacks boot --year 2027' },
  { prompt: '>', text: ' location ....... University of Virginia' },
  { prompt: '>', text: ' duration ....... 24 hours' },
  { prompt: '>', text: ' cost ........... $0.00' },
  { prompt: '>', text: ' theme .......... ▓▓▓▓▓▓▓▓░░░░' },
  { prompt: '>', text: ' status ......... LOADING_' },
];

// Extra ticks of pause between lines so typing doesn't feel machine-gunned.
const LINE_PAUSE = 10;

function typedLines(tick: number): { prompt: string; text: string }[] {
  const out: { prompt: string; text: string }[] = [];
  let budget = tick;
  for (const line of TERMINAL_LINES) {
    if (budget <= 0) break;
    out.push({
      prompt: line.prompt,
      text: line.text.slice(0, Math.min(budget, line.text.length)),
    });
    budget -= line.text.length + LINE_PAUSE;
  }
  return out;
}

function Terminal(): React.JSX.Element {
  const [tick, setTick] = useState(0);
  const totalTicks = TERMINAL_LINES.reduce(
    (sum, line) => sum + line.text.length + LINE_PAUSE,
    0,
  );

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => {
        if (t >= totalTicks) {
          clearInterval(id);
          return t;
        }
        return t + 1;
      });
    }, 28);
    return () => clearInterval(id);
  }, [totalTicks]);

  const lines = typedLines(tick);

  return (
    <div className="w-full max-w-md rounded-xl border border-white/10 bg-black/60 font-mono text-sm shadow-[0_0_70px_-15px_rgba(139,92,246,0.5)] backdrop-blur">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
        <span className="size-3 rounded-full bg-red-500/80" />
        <span className="size-3 rounded-full bg-yellow-500/80" />
        <span className="size-3 rounded-full bg-green-500/80" />
        <span className="ml-3 text-xs text-muted-foreground">
          hoohacks@uva:~
        </span>
      </div>
      <div className="min-h-[190px] space-y-2 px-4 py-4 text-left">
        {lines.map((line, i) => (
          <p key={i} className="whitespace-pre-wrap break-all">
            <span
              className={line.prompt === '$' ? 'text-accent' : 'text-primary'}
            >
              {line.prompt}
            </span>
            <span className="text-muted-foreground">{line.text}</span>
            {i === lines.length - 1 ? (
              <span className="animate-blink text-primary">█</span>
            ) : null}
          </p>
        ))}
      </div>
    </div>
  );
}

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}): React.JSX.Element {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      viewport={{ once: true, margin: '-60px' }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}

function SectionTag({ children }: { children: string }): React.JSX.Element {
  return (
    <p className="font-mono text-sm tracking-[0.35em] text-primary uppercase">
      {children}
    </p>
  );
}

const MARQUEE_ITEMS = [
  'THEME LOADING',
  '24 HOURS',
  '100% FREE',
  "VIRGINIA'S LARGEST HACKATHON",
  'ALL MAJORS WELCOME',
  'UVA · 2027',
  'TOP-50 US COLLEGIATE HACKATHON',
];

const STATS = [
  { value: '24', label: 'hours of hacking' },
  { value: '$0', label: 'cost to attend' },
  { value: '1–4', label: 'hackers per team' },
  { value: 'Top 50', label: 'US collegiate hackathon' },
];

const FEATURES = [
  {
    title: 'Build',
    description:
      'Go from idea to demo in one weekend — with workshops, mentors, and free resources to help you ship something real.',
    icon: (
      <svg
        className="size-6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    title: 'Connect',
    description:
      'Meet hundreds of hackers, engineers, and sponsor companies. Find your future teammates, co-founders, and friends.',
    icon: (
      <svg
        className="size-6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'Win',
    description:
      'Compete for prizes across tracks and sponsor challenges — or skip the competition and build purely for fun.',
    icon: (
      <svg
        className="size-6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    ),
  },
];

const FAQ_ITEMS = [
  {
    question: 'What is a hackathon?',
    answer: (
      <>
        A hackathon is a 24-hour tech event for teams of students to learn new
        skills, build cool tech projects, and meet tons of other students and
        tech professionals. There&apos;s food, awesome workshops, and super
        cool swag. Best of all — it&apos;s completely free!
      </>
    ),
  },
  {
    question: 'How much will it cost?',
    answer: (
      <>
        There is absolutely no cost for attending UVA&apos;s hackathon!
        We&apos;ll provide the resources for you to participate comfortably.
      </>
    ),
  },
  {
    question: 'Do I need a team?',
    answer: (
      <>
        If you are planning to compete for a prize, you may be in a team of 1-4
        people. If you don&apos;t have one yet, no worries! We will have a team
        formation workshop before hacking begins.
      </>
    ),
  },
  {
    question: 'Who can attend?',
    answer: (
      <>
        All current undergraduate, graduate, and high school students at least
        18 years of age may attend HooHacks.{' '}
        <strong className="text-foreground">
          No coding experience is necessary!
        </strong>{' '}
        Non-STEM majors, first-time hackers, and beginner coders are welcome
        and encouraged to join us!
      </>
    ),
  },
  {
    question: 'Coming soon!',
    answer: <>Schedule, location, team information, and more.</>,
  },
  {
    question: 'Have more questions?',
    answer: (
      <>
        Feel free to contact us at{' '}
        <a
          className="text-primary underline-offset-4 hover:underline"
          href="mailto:team@hoohacks.io"
        >
          team@hoohacks.io
        </a>{' '}
        if you have any questions, concerns, or feedback!
      </>
    ),
  },
];

function Landing(): React.JSX.Element {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <main className="flex-1 overflow-hidden">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="bg-grid absolute inset-0" />
            <div className="absolute top-[-20%] left-1/2 h-[500px] w-[min(800px,100vw)] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
            <div className="absolute right-[-10%] bottom-[-30%] h-[400px] w-[400px] rounded-full bg-fuchsia-600/10 blur-[100px]" />
          </div>
          <div className="container relative px-4 md:px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center space-y-6 text-center lg:items-start lg:text-left"
                initial={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 font-mono text-xs tracking-widest text-muted-foreground uppercase">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-primary" />
                  </span>
                  TBD 2027 · University of Virginia
                </span>
                <img
                  alt="HooHacks"
                  className="logo-glow w-full max-w-md"
                  src="big-logo.png"
                />
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  Virginia&apos;s{' '}
                  <span className="text-gradient">largest hackathon</span> is
                  rebooting<span className="animate-blink text-primary">_</span>
                </h1>
                <p className="max-w-xl text-muted-foreground md:text-lg">
                  24 hours of building, learning, and shipping alongside
                  hundreds of hackers — completely free. The 2027 theme is
                  still compiling. Be the first to know when it drops.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                  <a
                    className="inline-flex h-12 items-center justify-center rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 text-sm font-semibold text-white shadow-[0_0_35px_-8px_rgba(139,92,246,0.8)] transition hover:brightness-110"
                    href="#apply"
                  >
                    Get Notified →
                  </a>
                  <a
                    className="inline-flex h-12 items-center justify-center rounded-md border border-white/15 bg-white/5 px-8 text-sm font-medium text-foreground transition hover:border-primary/50 hover:bg-primary/10"
                    href="#about"
                  >
                    What is HooHacks?
                  </a>
                </div>
              </motion.div>
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-8"
                initial={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              >
                <div className="relative animate-float">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -inset-20 bg-[radial-gradient(circle,#000_42%,transparent_72%)]"
                  />
                  <img
                    alt="Glitchy Owl"
                    className="relative w-56 md:w-72"
                    src="glitch-owl.gif"
                  />
                </div>
                <Terminal />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Marquee Strip */}
        <div className="relative overflow-hidden border-y border-white/5 bg-white/[0.02] py-3">
          <div className="flex w-max animate-marquee whitespace-nowrap font-mono text-xs tracking-[0.3em] text-muted-foreground">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className="flex items-center">
                <span className="px-6">{item}</span>
                <span className="text-primary">{'//'}</span>
              </span>
            ))}
          </div>
        </div>

        {/* About Section */}
        <section className="relative py-20 md:py-28" id="about">
          <div className="container px-4 md:px-6">
            <Reveal className="mx-auto max-w-3xl space-y-4 text-center">
              <SectionTag>{'// about'}</SectionTag>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Built by students,{' '}
                <span className="text-gradient">for students.</span>
              </h2>
              <p className="text-muted-foreground md:text-xl">
                HooHacks is a team of students at the University of Virginia
                that runs Virginia&apos;s biggest hackathon — one of the 50
                biggest collegiate hackathons in the US. We also plan Ideathon,
                a networking event at the intersection of tech and
                entrepreneurship. Our goal is to make learning and software
                development at UVA and other colleges more accessible and fun!
              </p>
            </Reveal>

            <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
              {STATS.map((stat, i) => (
                <Reveal
                  key={stat.label}
                  className="rounded-xl border border-white/10 bg-card p-6 text-center transition hover:border-primary/40"
                  delay={i * 0.08}
                >
                  <p className="text-gradient font-mono text-3xl font-bold md:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </Reveal>
              ))}
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {FEATURES.map((feature, i) => (
                <Reveal
                  key={feature.title}
                  className="group rounded-xl border border-white/10 bg-card p-8 transition hover:border-primary/40 hover:shadow-[0_0_45px_-15px_rgba(139,92,246,0.5)]"
                  delay={i * 0.1}
                >
                  <div className="mb-5 inline-flex rounded-lg border border-primary/30 bg-primary/10 p-3 text-primary transition group-hover:bg-primary/20">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">
                    {feature.description}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Apply Section */}
        <section className="relative py-20 md:py-28" id="apply">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="h-[400px] w-[min(700px,100vw)] rounded-full bg-primary/15 blur-[120px]" />
          </div>
          <div className="container relative px-4 md:px-6">
            <Reveal className="mx-auto max-w-3xl rounded-2xl border border-primary/30 bg-card/80 p-6 shadow-[0_0_80px_-20px_rgba(139,92,246,0.5)] backdrop-blur md:p-10">
              <div className="space-y-3 text-center">
                <SectionTag>{'// stay updated'}</SectionTag>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Be first when the{' '}
                  <span className="text-gradient">theme drops.</span>
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Official HooHacks announcements and registration alerts,
                  straight to your inbox. Zero spam.
                </p>
              </div>

              <form
                action="https://hoohacks.us17.list-manage.com/subscribe/post"
                className="mt-8 w-full"
                method="POST"
                noValidate
              >
                <input name="u" type="hidden" value="8db3fa0f566f9edea113259df" />
                <input name="id" type="hidden" value="b74b5fd33d" />
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      className="h-11 w-full rounded-md border border-white/10 bg-black/40 px-4 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20 md:h-12"
                      name="FNAME"
                      placeholder="First Name"
                      type="text"
                    />
                    <input
                      className="h-11 w-full rounded-md border border-white/10 bg-black/40 px-4 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20 md:h-12"
                      name="LNAME"
                      placeholder="Last Name"
                      type="text"
                    />
                  </div>
                  <input
                    className="h-11 w-full rounded-md border border-white/10 bg-black/40 px-4 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20 md:h-12"
                    name="EMAIL"
                    placeholder="Email"
                    type="email"
                  />
                  <div className="pt-2 text-center">
                    <button
                      className="inline-flex h-11 w-full items-center justify-center rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 text-sm font-semibold text-white shadow-[0_0_35px_-8px_rgba(139,92,246,0.8)] transition hover:brightness-110 sm:w-auto md:h-12 md:px-10"
                      type="submit"
                    >
                      Subscribe →
                    </button>
                  </div>
                </div>
              </form>
            </Reveal>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 md:py-28" id="faq">
          <div className="container px-4 md:px-6">
            <Reveal className="mb-12 space-y-4 text-center">
              <SectionTag>{'// faq'}</SectionTag>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Frequently Asked Questions
              </h2>
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FAQ_ITEMS.map((item, i) => (
                <Reveal
                  key={item.question}
                  className="flex flex-col items-start gap-3 rounded-xl border border-white/10 bg-card p-6 py-8 transition hover:border-primary/40 hover:shadow-[0_0_45px_-15px_rgba(139,92,246,0.4)]"
                  delay={(i % 3) * 0.08}
                >
                  <span className="font-mono text-xs tracking-widest text-primary">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-xl font-bold">{item.question}</h3>
                  <p className="text-muted-foreground">{item.answer}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
    </motion.div>
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
