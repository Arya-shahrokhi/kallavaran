import { FiSearch } from 'react-icons/fi';
import ProductCard from './ProductCard.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { ProductGridSkeleton } from '../ui/Skeleton.jsx';

export default function ProductGrid({ products, loading, skeletonCount = 8, emptyAction }) {
  if (loading) return <ProductGridSkeleton count={skeletonCount} />;

  if (!products?.length) {
    return (
      <EmptyState
        icon={FiSearch}
        title="محصولی با این مشخصات پیدا نشد"
        description="فیلترها را کمی بازتر کنید یا عبارت دیگری را جست‌وجو کنید."
        {...emptyAction}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-9 min-[390px]:grid-cols-2 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
      {products.map((p, i) => <ProductCard key={p._id} product={p} priority={i < 4} />)}
    </div>
  );
}
