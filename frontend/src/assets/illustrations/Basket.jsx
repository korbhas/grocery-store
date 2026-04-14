export default function Basket({ size = 160, className = '' }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={className}
      stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      fill="none" aria-hidden="true">
      <path d="M30 70h100l-10 58c-1 6-6 10-12 10H52c-6 0-11-4-12-10L30 70z" />
      <path d="M50 70l20-30" />
      <path d="M110 70l-20-30" />
      <path d="M30 70h100" />
      <path d="M60 90v38" />
      <path d="M80 90v38" />
      <path d="M100 90v38" />
    </svg>
  );
}
