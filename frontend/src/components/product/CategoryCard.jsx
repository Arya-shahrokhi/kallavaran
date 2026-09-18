import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { toFa } from '../../utils/format.js';
import SmartImage from '../ui/SmartImage.jsx';

export default function CategoryCard({ category, size = 'md' }) {
  const tall = size === 'lg';

  return (
    <Link
      to={`/category/${category.slug}`}
      className={`category-card group relative flex h-full w-full overflow-hidden rounded-2xl bg-moss-900 ${
        tall ? 'min-h-[15rem] sm:min-h-[19rem] lg:min-h-[24rem]' : 'min-h-[10rem] sm:min-h-[11rem]'
      }`}
      aria-label={`مشاهده دسته‌بندی ${category.name}`}
    >
      {category.image?.url && (
        <SmartImage
          src={category.image.url}
          alt=""
          loading="lazy"
          decoding="async"
          className="category-card__image absolute inset-0 size-full object-cover"
          fallbackLabel=""
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/30 to-transparent" />
      <div className="category-card__veil absolute inset-0 bg-ink-900/70" />

      <div className="relative z-10 flex w-full flex-col items-center justify-center p-4 text-center sm:p-5">
        <h3
          className={`max-w-full break-words font-extrabold leading-tight tracking-tight text-bone-50 drop-shadow-sm ${
            tall
              ? 'text-[clamp(1.75rem,5vw,2.5rem)]'
              : 'text-[clamp(1.3rem,4vw,1.7rem)]'
          }`}
        >
          {category.name}
        </h3>

        {category.productsCount !== undefined && (
          <p className="category-card__meta num mt-2 hidden text-xs font-medium text-bone-200/85 sm:block">
            {toFa(category.productsCount)} محصول
          </p>
        )}

        <span className="category-card__action absolute bottom-4 left-4 hidden size-9 place-items-center rounded-full bg-bone-50/15 text-bone-50 sm:grid">
          <FiArrowLeft size={16} />
        </span>
      </div>
    </Link>
  );
}
