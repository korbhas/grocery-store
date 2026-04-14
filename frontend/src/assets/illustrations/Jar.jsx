export default function Jar({ size = 160, className = '' }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={className}
      stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      fill="none" aria-hidden="true">
      <rect x="46" y="36" width="68" height="20" rx="3" />
      <path d="M50 56h60l-4 78c0 4-4 8-8 8H62c-4 0-8-4-8-8l-4-78z" />
      <path d="M56 80h48" />
      <path d="M56 110h48" />
    </svg>
  );
}
