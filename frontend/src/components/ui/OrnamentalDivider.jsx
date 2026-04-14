import { Sprig } from '../../assets/illustrations';

export default function OrnamentalDivider({ className = '' }) {
  return (
    <div className={`flex items-center gap-4 my-10 ${className}`} aria-hidden="true">
      <span className="flex-1 h-px bg-hairline" />
      <Sprig size={32} className="text-moss/60" />
      <span className="flex-1 h-px bg-hairline" />
    </div>
  );
}
