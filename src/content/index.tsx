import React from 'react';
import ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import { About } from './about';
import { Faq } from './faq';
import { Hero } from './hero';
import { Notify } from './notify';

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
