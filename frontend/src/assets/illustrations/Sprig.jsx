export default function Sprig({ size = 80, className = '' }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} className={className}
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      fill="none" aria-hidden="true">
      <path d="M40 70V20" />
      <path d="M40 30c-6 0-12-4-14-10" />
      <path d="M40 40c6 0 12-4 14-10" />
      <path d="M40 50c-6 0-12-4-14-10" />
      <path d="M40 60c6 0 12-4 14-10" />
    </svg>
  );
}
