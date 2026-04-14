export default function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`bg-surface border border-hairline rounded-sm px-3.5 py-2.5 text-[15px] font-sans text-ink focus:border-moss focus:outline-none transition-colors ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
