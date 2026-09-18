import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Hero from './home/Hero.jsx';
import SectionHeader from './home/SectionHeader.jsx';
import WhyUs from './home/WhyUs.jsx';
import Journal from './home/Journal.jsx';
import SpecialOffers from './home/SpecialOffers.jsx';
import EssentialsShelf from './home/EssentialsShelf.jsx';
import CategoryCard from '../components/product/CategoryCard.jsx';
import ProductCarousel from '../components/product/ProductCarousel.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import Seo from '../components/common/Seo.jsx';
import { SkeletonBlock } from '../components/ui/Skeleton.jsx';
import { productApi } from '../services/endpoints.js';

export default function Home() {
  const { categories = [] } = useOutletContext() || {};
  const [state, setState] = useState({ featured: [], popular: [], offers: [], loading: true });

  useEffect(() => {
    let alive = true;
    Promise.all([
      productApi.list({ featured: 'true', limit: 10 }),
      productApi.list({ popular: 'true', sort: 'popular', limit: 8 }),
      productApi.list({ discounted: 'true', sort: 'discount', limit: 5 }),
    ])
      .then(([f, p, o]) => {
        if (!alive) return;
        setState({ featured: f.data.products, popular: p.data.products, offers: o.data.products, loading: false });
      })
      .catch(() => alive && setState((s) => ({ ...s, loading: false })));
    return () => { alive = false; };
  }, []);

  const { featured, popular, offers, loading } = state;

  return (
    <>
      <Seo
        title="خرید مطمئن گیاهان دارویی و ادویه"
        description="کالاوران، انتخاب دقیق گیاهان دارویی، ادویه‌های تازه و محصولات طبیعی برای آشپزخانه امروز."
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Store',
          name: 'کالاوران',
          description: 'فروشگاه آنلاین انتخاب‌های طبیعی و اصیل',
          address: { '@type': 'PostalAddress', addressLocality: 'تهران', addressCountry: 'IR' },
          telephone: '+989027403331',
        }}
      />

      <Hero />

      <section className="wrap py-16 sm:py-20" data-reveal>
        <SectionHeader
          eyebrow="دسته‌بندی"
          title="انتخابت را از اینجا شروع کن"
          description="از گیاهان دارویی تا ادویه‌های روزمره، قفسه مناسب خودت را پیدا کن."
        />
        {categories.length === 0 ? (
          <div className="grid gap-4 min-[390px]:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonBlock key={i} className="h-44 rounded-2xl" />)}
          </div>
        ) : (
          // چیدمان نامتقارن: دو کارت بلند + شش کارت کوتاه
          <div className="grid gap-4 min-[390px]:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 2).map((c) => (
              <div key={c._id} className="sm:col-span-1 lg:row-span-2"><CategoryCard category={c} size="lg" /></div>
            ))}
            {categories.slice(2, 8).map((c) => <CategoryCard key={c._id} category={c} />)}
          </div>
        )}
      </section>

      <section className="wrap py-4 sm:py-6" data-reveal>
        <SectionHeader eyebrow="پیشنهاد عطار" title="انتخاب‌های مطمئن" description="محصولاتی که از نظر کیفیت، تازگی و کاربرد روزمره از فیلتر ما گذشته‌اند." to="/products?featured=true" />
        <ProductCarousel products={featured} loading={loading} />
      </section>

      <EssentialsShelf />

      <SpecialOffers products={offers} loading={loading} />

      <section className="wrap pb-4" data-reveal>
        <SectionHeader eyebrow="انتخاب خریدهای تکرارشونده" title="خریدهای تکرارشونده" description="محصولاتی که مشتری‌ها بعد از اولین خرید دوباره سراغشان آمده‌اند." to="/products?popular=true" />
        <ProductGrid products={popular} loading={loading} skeletonCount={8} />
      </section>

      <WhyUs />
      <Journal />
    </>
  );
}
