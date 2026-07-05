interface LogoProps {
  className?: string;
  tone?: "light" | "dark";
}

/** Wordmark with a sealed-block mark. Used in the public nav and app shell. */
export default function Logo({ className = "", tone = "dark" }: LogoProps) {
  const text = tone === "light" ? "text-white" : "text-qb-ink";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <rect x="3" y="3" width="26" height="26" rx="8" fill="#2E43C9" />
        <path
          d="M 11 16 l 3.5 4 l 7 -8"
          stroke="#17B6A5"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span className={`font-display text-lg font-bold tracking-tight ${text}`}>
        Quantum<span className="text-qb-primary">Ballot</span>
      </span>
    </span>
  );
}
