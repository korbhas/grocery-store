const VARIANTS = {
  primary: 'bg-moss text-canvas hover:bg-moss-deep focus-visible:bg-moss-deep',
  secondary: 'bg-transparent text-ink border border-hairline hover:bg-hairline/40',
  ghost: 'bg-transparent text-moss hover:text-moss-deep underline underline-offset-4 decoration-moss/40 hover:decoration-moss-deep',
  danger: 'bg-transparent text-danger border border-danger/30 hover:bg-danger/10',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm min-h-[36px]',
  md: 'px-5 py-2.5 text-[15px] min-h-[44px]',
  lg: 'px-7 py-3.5 text-base min-h-[52px]',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-sm font-sans font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
  const width = fullWidth ? 'w-full' : '';
  return (
    <button className={`${base} ${VARIANTS[variant]} ${SIZES[size]} ${width} ${className}`} {...props}>
      {children}
    </button>
  );
}
