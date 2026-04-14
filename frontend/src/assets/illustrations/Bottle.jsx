export default function Bottle({ size = 160, className = '' }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={className}
      stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      fill="none" aria-hidden="true">
      <path d="M70 24h20v20c0 4 2 6 4 10 6 10 10 18 10 32v54c0 4-4 8-8 8H64c-4 0-8-4-8-8V86c0-14 4-22 10-32 2-4 4-6 4-10V24z" />
      <path d="M64 86h32" />
      <rect x="66" y="98" width="28" height="22" rx="2" />
    </svg>
  );
}
