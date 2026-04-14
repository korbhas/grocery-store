import Illustration from './Illustration';

export default function EmptyState({ illustration = 'Basket', title, body, action }) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-4">
      <Illustration name={illustration} size={120} className="text-moss/70 mb-6" />
      <h2 className="font-serif text-2xl text-ink mb-2">{title}</h2>
      {body && <p className="text-ink-muted max-w-md mb-6">{body}</p>}
      {action}
    </div>
  );
}
