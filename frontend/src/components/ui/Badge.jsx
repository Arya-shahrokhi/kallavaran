export default function Badge({ children, tone = 'moss', className = '' }) {
  const tones = {
    moss: 'bg-moss-100 text-moss-900',
    saffron: 'bg-saffron-50 text-saffron-600',
    berry: 'bg-berry-100 text-berry-600',
    neutral: 'bg-bone-200 text-ink-700',
    solid: 'bg-ink-900 text-bone-50',
  };
  return <span className={`chip ${tones[tone]} ${className}`}>{children}</span>;
}
