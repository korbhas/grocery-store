export default function Textarea({ className = '', rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`w-full bg-surface border border-hairline rounded-sm px-3.5 py-2.5 text-[15px] font-sans text-ink placeholder:text-ink-muted focus:border-moss focus:outline-none transition-colors resize-vertical ${className}`}
      {...props}
    />
  );
}
