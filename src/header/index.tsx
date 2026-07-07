import React from 'react';
import ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import { MobileMenuButton } from './mobile-menu-button';
import './header.css';

function Header(): React.JSX.Element {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center gap-6">
        <a className="group flex items-center gap-2" href="/">
          <img
            alt="Logo"
            className="rounded transition group-hover:drop-shadow-[0_0_10px_rgba(139,92,246,0.7)]"
            height="32"
            src="/logo.svg"
            width="32"
          />
          <span className="text-xl font-bold tracking-tight">HooHacks</span>
          <span className="hidden rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] tracking-widest text-primary sm:inline">
            2027
          </span>
        </a>
        <nav className="hidden flex-1 items-center gap-6 sm:flex">
          <a
            className="font-mono text-sm text-muted-foreground transition hover:text-primary"
            href="#about"
          >
            About
          </a>
          <a
            className="font-mono text-sm text-muted-foreground transition hover:text-primary"
            href="#faq"
          >
            FAQ
          </a>
          <a
            className="ml-auto inline-flex h-9 items-center justify-center rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 text-sm font-semibold text-white shadow-[0_0_25px_-8px_rgba(139,92,246,0.8)] transition hover:brightness-110"
            href="#apply"
          >
            Get Notified
          </a>
        </nav>
        <MobileMenuButton />
      </div>
    </header>
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
