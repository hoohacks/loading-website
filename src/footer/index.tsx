import React from 'react';
import ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';

function Footer(): React.JSX.Element {
  return (
    <footer className="border-t border-muted bg-background">
      <div className="px-4 py-12 md:px-6 md:py-16 mx-auto max-w-7xl">
        <div className="grid gap-8 grid-cols-2 md:grid-cols-5">
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <a className="flex items-center gap-2" href="/">
              <img
                alt="Logo"
                className="rounded"
                height="32"
                src="/logo.svg"
                width="32"
              />
              <span className="text-xl font-bold">HooHacks</span>
            </a>
            <p className="mt-4 max-w-xs text-muted-foreground">
              HooHacks 2027 is coming soon! Join us for an unforgettable weekend of innovation and collaboration.
            </p>
            <div className="mt-6 flex gap-4">
              {[
                {
                  name: 'Instagram',
                  icon: (
                    <svg
                      className="size-5"
                      fill="none"
                      height="20"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect height="20" rx="5" ry="5" width="20" x="2" y="2" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  ),
                  link: 'https://www.instagram.com/hoohacks/'
                },
                {
                  name: 'LinkedIn',
                  icon: (
                    <svg
                      className="size-5"
                      fill="none"
                      height="20"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect height="12" width="4" x="2" y="9" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  ),
                  link: 'https://www.linkedin.com/company/hoohacks/'
                },
                {
                  name: 'Twitter',
                  icon: (
                    <svg
                      className="size-5"
                      fill="none"
                      height="20"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  ),
                  link: 'https://x.com/hoohacks'
                },
              ].map((social) => (
                <a
                  className="rounded-full bg-muted p-2 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  href={social.link}
                  key={social.name}
                >
                  <span className="sr-only">{social.name}</span>
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          <div className='hidden md:block'>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              About
            </h3>
            <ul className="space-y-2">
              {[{ text: 'Top', link: '/#' }, { text: 'About', link: '/#about' }, { text: 'FAQ', link: '/#faq' }].map(
                (item) => (
                  <li key={item.link}>
                    <a
                      className="text-muted-foreground hover:text-foreground"
                      href={item.link}
                    >
                      {item.text}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>
          <div className='hidden md:block'>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Links
            </h3>
            <ul className="space-y-2">
              {[{ text: 'Instagram', link: 'https://www.instagram.com/hoohacks/' }, { text: 'LinkedIn', link: 'https://www.linkedin.com/company/hoohacks/' }, { text: 'Twitter', link: 'https://x.com/hoohacks' }].map(
                (item) => (
                  <li key={item.link}>
                    <a
                      className="text-muted-foreground hover:text-foreground"
                      href={item.link}
                    >
                      {item.text}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Contact Us
            </h3>
            <ul className="space-y-2">
              {[{ text: 'team@hoohacks.io', link: 'mailto:team@hoohacks.io' }].map(
                (item) => (
                  <li key={item.link}>
                    <a
                      className="text-muted-foreground hover:text-foreground"
                      href={item.link}
                    >
                      {item.text}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} HooHacks | <a href="https://github.com/MLH/mlh-policies/blob/main/code-of-conduct.md">MLH Code of Conduct</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export const { bootstrap, mount, unmount } = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: Footer,
  errorBoundary() {
    return <></>;
  },
});
