export default function Sun({ size = 96, className = '' }) {
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} className={className}
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      fill="none" aria-hidden="true">
      <circle cx="48" cy="48" r="16" />
      <path d="M48 14v10" />
      <path d="M48 72v10" />
      <path d="M14 48h10" />
      <path d="M72 48h10" />
      <path d="M24 24l7 7" />
      <path d="M65 65l7 7" />
      <path d="M72 24l-7 7" />
      <path d="M31 65l-7 7" />
    </svg>
  );
}
