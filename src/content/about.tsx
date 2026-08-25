import { Eyebrow, Reveal } from './primitives';
import { Resolve } from './resolve';

const WHAT_TO_EXPECT = [
  {
    heading: 'Build a project',
    body: 'You have 24 hours to make something and demo it at the end. Workshops run throughout, and mentors are on the floor if you get stuck.',
  },
  {
    heading: 'Meet other students',
    body: '800+ students attend, along with engineers from sponsor companies. Team formation happens on site if you arrive without one.',
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

export function About(): React.JSX.Element {
  return (
    <section className="shell border-t border-rule py-20 md:py-28" id="about">
      <div className="grid gap-10 md:grid-cols-[5fr_7fr] md:gap-16">
        <Reveal>
          <Eyebrow>About</Eyebrow>
          <h2 className="t-h2 mt-6 text-[clamp(1.9rem,4.2vw,3rem)] text-chalk">
            <Resolve>A student-run hackathon, open to everyone.</Resolve>
          </h2>
          <img
            alt=""
            aria-hidden
            className="mt-10 w-28 mix-blend-screen md:mt-14 md:w-36"
            height={169}
            loading="lazy"
            src="/glitch-owl.webp"
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
            <p className="t-body mt-3.5 text-[0.9375rem] text-haze">{item.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

