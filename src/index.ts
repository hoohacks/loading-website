import { mountVercelToolbar } from '@vercel/toolbar/vite';
import { registerApplication, start } from 'single-spa';
import './globals.css';

// The header and footer are defined within the root.
registerApplication(
  'header',
  () => import('./header'),
  () => true,
);

registerApplication(
  'footer',
  () => import('./footer'),
  () => true,
);

registerApplication(
  'content',
  () => import('./content'),
  () => true,
);

start();
mountVercelToolbar();
