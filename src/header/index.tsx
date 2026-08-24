import React, { useEffect, useState } from 'react';
import ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import { APPLY_URL } from '../apply-link';
import { MobileMenu } from './mobile-menu';
import { NAV_LINKS } from './nav-links';
import './header.css';

/*
 * True once anything has scrolled beneath the sticky bar. The bar only takes
 * on a material and a divider when there is content under it to separate.
 */
function useScrolledUnder(threshold = 4): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let queued = false;

    const read = (): void => {
      queued = false;
      setScrolled(window.scrollY > threshold);
    };
    const onScroll = (): void => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(read);
    };

    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [threshold]);

  return scrolled;
}

function Header(): React.JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScrolledUnder();

  return (
    <>
      <div className="w-full border-b border-rule bg-slab">
        <div className="shell flex h-9 items-center justify-center gap-3 md:h-10">
          <span aria-hidden className="size-1.5 shrink-0 bg-primary" />
          <p className="t-label truncate text-haze">
            <span className="hidden sm:inline">
              Applications are open to join the HooHacks team
            </span>
            <span className="sm:hidden">Applications open</span>
          </p>
          <a
            className="t-label shrink-0 text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary"
            href={APPLY_URL}
            rel="noreferrer"
            target="_blank"
          >
            Apply
          </a>
        </div>
      </div>

      <header className={`chrome w-full${scrolled ? ' chrome--lifted' : ''}`}>
        <div className="shell flex h-16 items-center gap-8">
          <a aria-label="HooHacks home" className="group flex items-center" href="/">
            <img
              alt=""
              aria-hidden
              className="transition-[filter] duration-200 group-hover:drop-shadow-[0_0_10px_rgba(167,139,250,0.65)]"
              height="30"
              src="/logo.svg"
              width="35"
            />
          </a>

          <nav
            aria-label="Main"
            className="ml-auto hidden items-center gap-8 sm:flex"
          >
            {NAV_LINKS.map((link) => (
              <a
                className="text-sm text-haze transition-colors hover:text-chalk active:text-primary"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </a>
            ))}
            <a className="btn btn-primary h-9 px-4 text-sm" href="#notify">
              Get notified
            </a>
          </nav>

          <button
            aria-controls="mobile-menu"
            aria-expanded={menuOpen}
            className="icon-btn ml-auto inline-flex size-9 items-center justify-center rounded-[2px] border border-rule text-chalk hover:border-primary hover:text-primary sm:hidden"
            onClick={() => {
              setMenuOpen(true);
            }}
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
              <line x1="3" x2="21" y1="7" y2="7" />
              <line x1="3" x2="21" y1="17" y2="17" />
            </svg>
            <span className="sr-only">Open menu</span>
          </button>
        </div>
      </header>

      {/*
        The menu sits outside <header> on purpose: the header carries a
        backdrop-filter, which makes it a containing block for fixed-position
        descendants and would pin the overlay to the 64px header box.
      */}
      <MobileMenu
        onClose={() => {
          setMenuOpen(false);
        }}
        open={menuOpen}
      />
    </>
  );
}

export const { bootstrap, mount, unmount } = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: Header,
  errorBoundary() {
    return <></>;
  },
});
