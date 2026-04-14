export default function Cup({ size = 160, className = '' }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={className}
      stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      fill="none" aria-hidden="true">
      <path d="M46 60h60l-4 54c0 10-8 18-18 18H68c-10 0-18-8-18-18l-4-54z" />
      <path d="M106 74h10c8 0 14 6 14 14s-6 14-14 14h-8" />
      <path d="M64 36c-2 6-2 12 0 18" />
      <path d="M78 36c-2 6-2 12 0 18" />
      <path d="M92 36c-2 6-2 12 0 18" />
    </svg>
  );
}
