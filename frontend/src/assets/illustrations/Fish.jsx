export default function Fish({ size = 160, className = '' }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={className}
      stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      fill="none" aria-hidden="true">
      <path d="M30 80c10-20 32-32 56-32 18 0 32 8 44 24l16-12v40l-16-12c-12 16-26 24-44 24-24 0-46-12-56-32z" />
      <circle cx="62" cy="74" r="2" fill="currentColor" />
      <path d="M80 70c4 4 4 16 0 20" />
    </svg>
  );
}
