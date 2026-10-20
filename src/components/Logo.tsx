export function LogoIcon({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect width="48" height="48" rx="11" className="fill-primary" />
      <rect x="11" y="10" width="22" height="26" rx="3" className="fill-secondary" transform="rotate(-10 22 23)" />
      <rect x="15" y="13" width="22" height="26" rx="3" className="fill-card" />
      <rect x="19" y="19" width="12" height="2.5" rx="1.25" className="fill-primary" />
      <rect x="19" y="25" width="8" height="2.5" rx="1.25" className="fill-primary" />
      <circle cx="36" cy="36" r="8" className="fill-accent" />
      <path d="M32.5 36.2l2.4 2.4 4.6-4.8" fill="none" className="stroke-card" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoIcon />
      <span className="text-xl font-extrabold uppercase leading-none tracking-wide">
        <span className="text-primary">Uppdrags</span>
        <span className="text-accent">banken</span>
      </span>
    </span>
  );
}
