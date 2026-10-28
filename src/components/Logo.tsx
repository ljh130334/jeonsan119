export function LogoSymbol({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <rect x="7" y="8" width="18" height="13" rx="2" className="fill-white" />
      <rect x="13" y="21" width="6" height="2" className="fill-white" />
      <rect x="11" y="23" width="10" height="1.5" rx="0.75" className="fill-white" />
      <polyline
        points="9,15 13,15 14.5,12 17,18 18.5,15 23,15"
        fill="none"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-coral"
      />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoSymbol />
      <span className="text-xl font-extrabold tracking-tight">
        <span className="text-ink">전산</span>
        <span className="text-coral">119</span>
      </span>
    </span>
  );
}
