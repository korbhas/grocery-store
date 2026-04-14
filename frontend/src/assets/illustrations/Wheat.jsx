export default function Wheat({ size = 80, className = '' }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} className={className}
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      fill="none" aria-hidden="true">
      <path d="M40 74V20" />
      <ellipse cx="40" cy="26" rx="5" ry="8" />
      <ellipse cx="32" cy="36" rx="5" ry="8" />
      <ellipse cx="48" cy="36" rx="5" ry="8" />
      <ellipse cx="32" cy="50" rx="5" ry="8" />
      <ellipse cx="48" cy="50" rx="5" ry="8" />
    </svg>
  );
}
