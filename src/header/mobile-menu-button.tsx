import { useState } from 'react';
import { MobileMenu } from './mobile-menu';

export function MobileMenuButton(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="ml-auto flex sm:hidden">
        <button
          className="inline-flex h-9 items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          id="mobile-menu-button"
          onClick={() => {
            setIsOpen(true);
          }}
          type="button"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
          <span className="sr-only">Open menu</span>
        </button>
      </div>
      <MobileMenu onClose={() => setIsOpen(false)} open={isOpen} />
    </>
  );
}
