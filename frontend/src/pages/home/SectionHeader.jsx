import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function SectionHeader({ eyebrow, title, description, to, linkLabel = 'مشاهده همه' }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="text-2xs font-bold uppercase tracking-[0.14em] text-moss-600">{eyebrow}</p>}
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-[52ch] text-sm leading-7 text-ink-500">{description}</p>}
      </div>
      {to && (
        <Link to={to} className="group flex items-center gap-1.5 text-sm font-semibold text-moss-700 hover:text-moss-900">
          {linkLabel}
          <FiArrowLeft size={16} className="transition-transform duration-200 ease-quart group-hover:-translate-x-1" />
        </Link>
      )}
    </div>
  );
}
