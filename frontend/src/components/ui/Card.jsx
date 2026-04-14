export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-surface border border-hairline rounded-md shadow-soft ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
