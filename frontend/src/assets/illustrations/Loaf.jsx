export default function Loaf({ size = 160, className = '' }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={className}
      stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      fill="none" aria-hidden="true">
      <path d="M30 100c0-22 22-40 50-40s50 18 50 40c0 6-4 10-10 10H40c-6 0-10-4-10-10z" />
      <path d="M56 80c-4 6-6 14-6 22" />
      <path d="M80 72c-4 6-6 16-6 26" />
      <path d="M104 80c-4 6-6 14-6 22" />
    </svg>
  );
}
