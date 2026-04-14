export default function Leaf({ size = 160, className = '' }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={className}
      stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      fill="none" aria-hidden="true">
      <path d="M36 124c0-44 36-80 80-80 4 0 8 4 8 8 0 44-36 80-80 80-4 0-8-4-8-8z" />
      <path d="M44 116l70-70" />
      <path d="M60 104c4-8 12-16 20-20" />
      <path d="M74 118c6-10 16-20 26-24" />
    </svg>
  );
}
