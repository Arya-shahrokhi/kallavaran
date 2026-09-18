import { FiHeart } from 'react-icons/fi';
import ProductGrid from '../../components/product/ProductGrid.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Seo from '../../components/common/Seo.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { toFa } from '../../utils/format.js';

export default function Wishlist() {
  const { products, loading } = useWishlist();

  return (
    <>
      <Seo title="علاقه‌مندی‌ها" />
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-extrabold tracking-tight">علاقه‌مندی‌ها</h1>
        {products.length > 0 && <span className="num text-sm text-ink-400">{toFa(products.length)} کالا</span>}
      </div>

      <div className="mt-6">
        {!loading && products.length === 0 ? (
          <div className="rounded-2xl border hairline bg-bone-100">
            <EmptyState icon={FiHeart} title="لیست علاقه‌مندی خالی است" description="روی قلب هر محصول بزنید تا اینجا ذخیره شود." action="مشاهده محصولات" to="/products" />
          </div>
        ) : (
          <ProductGrid products={products} loading={loading} skeletonCount={4} />
        )}
      </div>
    </>
  );
}
