export default function Pear({ size = 160, className = '' }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={className}
      stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      fill="none" aria-hidden="true">
      <path d="M80 140c-22 0-36-18-36-40 0-22 12-40 28-44 4-1 8-6 8-12 0-6 4-10 8-10s8 4 8 10c0 6 2 10 8 14 14 8 20 26 20 42 0 22-14 40-36 40z" />
      <path d="M80 44c4-6 12-8 18-6" />
      <circle cx="74" cy="92" r="1.5" fill="currentColor" />
    </svg>
  );
}
