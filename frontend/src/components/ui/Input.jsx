export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full bg-surface border border-hairline rounded-sm px-3.5 py-2.5 text-[15px] font-sans text-ink placeholder:text-ink-muted focus:border-moss focus:outline-none transition-colors ${className}`}
      {...props}
    />
  );
}
