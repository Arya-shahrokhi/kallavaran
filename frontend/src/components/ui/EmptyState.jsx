import Button from './Button.jsx';

export default function EmptyState({ icon: Icon, title, description, action, onAction, to, tone = 'moss' }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {Icon && (
        <div className={`mb-5 grid size-16 place-items-center rounded-2xl ${tone === 'moss' ? 'bg-moss-50 text-moss-600' : 'bg-bone-100 text-ink-400'}`}>
          <Icon size={28} />
        </div>
      )}
      <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm leading-7 text-ink-500">{description}</p>}
      {action && (
        <Button className="mt-6" to={to} onClick={onAction} variant="primary" size="md">{action}</Button>
      )}
    </div>
  );
}
