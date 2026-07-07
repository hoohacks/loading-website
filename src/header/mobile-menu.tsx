export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}): React.JSX.Element {
  return (
    <div
      className={`fixed top-0 inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden${open ? '' : ' hidden'}`}
      id="mobile-menu"
    >
      <div className="fixed inset-y-0 top-0 right-0 w-full min-h-svh max-w-xs bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <a className="flex items-center gap-2" href="/" onClick={onClose}>
            <img
              alt="Logo"
              className="rounded"
              height="32"
              src="/logo.svg"
              width="32"
            />
            <span className="text-xl font-bold">HooHacks</span>
          </a>
          <button
            className="inline-flex h-9 items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            id="close-mobile-menu"
            onClick={onClose}
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
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
            <span className="sr-only">Close menu</span>
          </button>
        </div>
        <nav className="mt-6 flex flex-col gap-4">
          <a
            className="font-mono text-base font-medium text-muted-foreground hover:text-primary"
            href="#about"
            onClick={onClose}
          >
            About
          </a>
          <a
            className="font-mono text-base font-medium text-muted-foreground hover:text-primary"
            href="#faq"
            onClick={onClose}
          >
            FAQ
          </a>
          <a
            className="mt-2 inline-flex h-10 items-center justify-center rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 text-sm font-semibold text-white shadow-[0_0_25px_-8px_rgba(139,92,246,0.8)]"
            href="#apply"
            onClick={onClose}
          >
            Get Notified
          </a>
        </nav>
      </div>
    </div>
  );
}
