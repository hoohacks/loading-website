import { motion } from 'framer-motion';
import React, { useEffect } from 'react';
import ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';

function Landing(): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2 text-center lg:text-left">
                  {/* <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-foreground">
                    HooHacks 2026
                  </h1> */}
                  <img
                    alt="Glitchy Owl"
                    className="rounded-lg object-cover w-full"
                    height="550"
                    src="big-logo.png"
                    width="550"
                  />
                  <p className="text-muted-foreground md:text-xl font-mono w-full">
                    // TBD 2027 | University of Virginia
                    <br />
                    // theme loading_
                  </p>
                  <p>
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <img
                  alt="Glitchy Owl"
                  className="rounded-lg object-cover"
                  height="550"
                  src="glitch-owl.gif"
                  width="550"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Apply Section */}
        <section className="bg-primary py-20 text-primary-foreground" id="apply">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-background/60 p-6 shadow-sm backdrop-blur md:p-10">
              <div className="space-y-3 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Stay Updated!
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Subscribe to get official HooHacks announcements and registration alerts.
                </p>
              </div>

              {/* Apply Today! */}
              {/*
              <a
                href="https://app.hoohacks.io/register"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-md bg-white px-8 py-2 text-sm font-medium text-primary shadow transition-colors hover:bg-white/90"
                type="button"
              >
                Apply Today!
              </a>
              */}

              <form
                className="mt-8 w-full"
                action="https://hoohacks.us17.list-manage.com/subscribe/post"
                method="POST"
                noValidate
              >
                <input type="hidden" name="u" value="8db3fa0f566f9edea113259df" />
                <input type="hidden" name="id" value="b74b5fd33d" />
                <div className="space-y-4 md:space-y-6">
                  <input
                    type="text"
                    name="FNAME"
                    placeholder="First Name"
                    className="h-11 w-full rounded-md border border-white/10 bg-black/30 px-4 text-sm text-foreground outline-none transition focus:border-white/20 focus:ring-2 focus:ring-white/10 md:h-12"
                  />

                  <input
                    type="text"
                    name="LNAME"
                    placeholder="Last Name"
                    className="h-11 w-full rounded-md border border-white/10 bg-black/30 px-4 text-sm text-foreground outline-none transition focus:border-white/20 focus:ring-2 focus:ring-white/10 md:h-12"
                  />

                  <input
                    type="email"
                    name="EMAIL"
                    placeholder="Email"
                    className="h-11 w-full rounded-md border border-white/10 bg-black/30 px-4 text-sm text-foreground outline-none transition focus:border-white/20 focus:ring-2 focus:ring-white/10 md:h-12"
                  />

                  <div className="pt-2 text-center">
                    <button
                      type="submit"
                      className="inline-flex h-11 items-center justify-center rounded-md bg-white px-6 text-sm font-medium text-primary transition-colors hover:bg-white/90 md:h-12 md:px-8"
                    >
                      Subscribe!
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20" id="about">
          <div className="container px-4 md:px-6">
            <div className="mb-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                About
              </h2>
              <p className="mx-auto mt-4 max-w-[950px] text-muted-foreground md:text-xl">
                HooHacks is a team of students at the University of Virginia that runs HooHacks, Virginia's biggest hackathon and one of the 50 biggest collegiate hackathons in the US. HooHacks also plans Ideathon, a networking event at the intersection of tech and entrepreneurship. Our goal is to make learning and software development at UVA and other colleges more accessible and fun!
              </p>
            </div>
          </div>
        </section>


        {/* FAQ Section */}
        <section className="bg-primary py-20" id="faq">
          <div className="container px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-start gap-2 rounded-lg border bg-primary p-6 shadow-sm py-10">
                <h3 className="text-xl font-bold">What is a hackathon?</h3>
                <p className="text-muted-foreground">
                  A hackathon is a 24-hour tech event for teams of students to learn new skills, build cool tech projects, and meet tons of other students and tech professionals. There's food, awesome workshops, and super cool swag. Best of all — it's completely free!
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 rounded-lg border bg-primary p-6 shadow-sm py-10">
                <h3 className="text-xl font-bold">How much will it cost?</h3>
                <p className="text-muted-foreground">
                  There is absolutely no cost for attending UVA’s hackathon! We'll provide the resources for you to participate comfortably.
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 rounded-lg border bg-primary p-6 shadow-sm py-10">
                <h3 className="text-xl font-bold">Do I need a team?</h3>
                <p className="text-muted-foreground">
                  If you are planning to compete for a prize, you may be in a team of 1-4 people. If you don't have one yet, no worries! We will have a team formation workshop before hacking begins.
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 rounded-lg border bg-primary p-6 shadow-sm py-10">
                <h3 className="text-xl font-bold">Who can attend?</h3>
                <p className="text-muted-foreground">
                  All current undergraduate, graduate, and high school students at least 18 years of age may attend HooHacks. <strong>No coding experience is necessary!</strong> Non-STEM majors, first-time hackers, and beginner coders are welcome and encouraged to join us!
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 rounded-lg border bg-primary p-6 shadow-sm py-10">
                <h3 className="text-xl font-bold">Coming soon!</h3>
                <p className="text-muted-foreground">
                  Schedule, location, team information, and more.
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 rounded-lg border bg-primary p-6 shadow-sm py-10">
                <h3 className="text-xl font-bold">Have more questions?</h3>
                <p className="text-muted-foreground">
                  Feel free to contact us at <a href="mailto:team@hoohacks.io">team@hoohacks.io</a> if you have any questions, concerns, or feedback!
                </p>
              </div>
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
