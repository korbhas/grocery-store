const TONES = {
  sage: 'bg-sage text-moss-deep',
  butter: 'bg-butter text-ink',
  rose: 'bg-rose text-clay',
  danger: 'bg-danger/10 text-danger',
  moss: 'bg-moss/10 text-moss-deep',
};

export default function Badge({ tone = 'sage', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-[11px] font-medium font-sans uppercase tracking-eyebrow ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
