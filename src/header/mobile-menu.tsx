import { useEffect } from 'react';
import { APPLY_URL } from '../apply-link';
import { NAV_LINKS } from './nav-links';

export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}): React.JSX.Element {
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-ink sm:hidden${open ? '' : ' hidden'}`}
      id="mobile-menu"
    >
      <div className="shell flex h-16 items-center border-b border-rule">
        <a aria-label="HooHacks home" className="flex items-center" href="/" onClick={onClose}>
          <img alt="" aria-hidden height="30" src="/logo.svg" width="35" />
        </a>
        <button
          className="ml-auto inline-flex size-9 items-center justify-center rounded-[2px] border border-rule text-chalk"
          onClick={onClose}
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
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
          <span className="sr-only">Close menu</span>
        </button>
      </div>

      <nav aria-label="Main" className="shell flex flex-col pt-8">
        {NAV_LINKS.map((link) => (
          <a
            className="t-h2 border-b border-rule py-5 text-4xl text-chalk"
            href={link.href}
            key={link.href}
            onClick={onClose}
          >
            {link.label}
          </a>
        ))}
        <a className="btn btn-primary mt-8" href="#notify" onClick={onClose}>
          Get notified
        </a>
        <a
          className="btn btn-quiet mt-3"
          href={APPLY_URL}
          rel="noreferrer"
          target="_blank"
        >
          Apply to join the team
        </a>
      </nav>
    </div>
  );
}
