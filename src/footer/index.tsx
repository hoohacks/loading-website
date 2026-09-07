import React from 'react';
import ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
// Applications are closed. Uncomment with TEAM_LINKS below when they reopen.
// import { APPLY_URL } from '../apply-link';

const SOCIALS = [
  { name: 'Instagram', href: 'https://www.instagram.com/hoohacks/' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/company/hoohacks/' },
  { name: 'Twitter', href: 'https://x.com/hoohacks' },
];

const SITE_LINKS = [
  { name: 'Top', href: '/#' },
  { name: 'About', href: '/#about' },
  { name: 'FAQ', href: '/#faq' },
];

// const TEAM_LINKS = [{ name: 'Apply to join the team', href: APPLY_URL }];

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: { name: string; href: string }[];
}): React.JSX.Element {
  return (
    <div>
      <h2 className="t-label text-slate">{title}</h2>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <a
              className="text-sm text-haze transition-colors hover:text-primary active:text-primary"
              href={link.href}
            >
              {link.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Footer(): React.JSX.Element {
  return (
    <footer className="border-t border-rule bg-ink">
      <div className="shell py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-[5fr_7fr] md:gap-16">
          <div>
            <a className="group flex items-center gap-2.5" href="/">
              <img
                alt=""
                aria-hidden
                className="split-hover"
                height="26"
                src="/logo.svg"
                width="30"
              />
              <span className="t-h3 text-lg text-chalk">HooHacks</span>
            </a>
            <p className="t-body mt-5 max-w-[38ch] text-sm text-haze">
              Virginia&rsquo;s largest hackathon, run by students at the
              University of Virginia. The 2027 dates and theme have not been
              announced yet.
            </p>
          </div>

          {/* Back to md:grid-cols-4 when the "Get involved" column returns. */}
          <div className="grid grid-cols-2 gap-10 md:grid-cols-3">
            <LinkColumn links={SITE_LINKS} title="This page" />
            {/* <LinkColumn links={TEAM_LINKS} title="Get involved" /> */}
            <LinkColumn links={SOCIALS} title="Follow" />
            <LinkColumn
              links={[
                { name: 'team@hoohacks.io', href: 'mailto:team@hoohacks.io' },
              ]}
              title="Contact"
            />
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-rule pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-label text-slate">
            &copy; {new Date().getFullYear()} HooHacks
          </p>
          <a
            className="t-label text-slate transition-colors hover:text-primary"
            href="https://github.com/MLH/mlh-policies/blob/main/code-of-conduct.md"
            rel="noreferrer"
            target="_blank"
          >
            MLH Code of Conduct
          </a>
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
