import * as all from '../../assets/illustrations';

export default function Illustration({ name, size = 160, className = '' }) {
  const Component = all[name] || all.Leaf;
  return <Component size={size} className={className} />;
}
