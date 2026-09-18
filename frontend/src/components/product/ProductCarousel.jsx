import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation } from 'swiper/modules';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import 'swiper/css';
import 'swiper/css/free-mode';
import ProductCard from './ProductCard.jsx';
import { ProductCardSkeleton } from '../ui/Skeleton.jsx';

export default function ProductCarousel({ products, loading }) {
  const prev = useRef(null);
  const next = useRef(null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 min-[390px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    );
  }
  if (!products?.length) return null;

  return (
    <div className="relative">
      <Swiper
        modules={[Navigation, FreeMode]}
        dir="rtl"
        spaceBetween={16}
        freeMode
        navigation={{ prevEl: prev.current, nextEl: next.current }}
        onBeforeInit={(swiper) => { swiper.params.navigation.prevEl = prev.current; swiper.params.navigation.nextEl = next.current; }}
        breakpoints={{
          0: { slidesPerView: 1.35 },
          480: { slidesPerView: 2.1 },
          768: { slidesPerView: 3.1, spaceBetween: 22 },
          1280: { slidesPerView: 4, spaceBetween: 26 },
        }}
        className="!overflow-visible"
      >
        {products.map((p) => (
          <SwiperSlide key={p._id} className="h-auto">
            <ProductCard product={p} />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="absolute -top-[3.4rem] left-0 hidden gap-2 md:flex">
        {[[prev, FiChevronRight, 'قبلی'], [next, FiChevronLeft, 'بعدی']].map(([ref, Icon, label], i) => (
          <button
            key={i}
            ref={ref}
            aria-label={label}
            className="grid size-10 place-items-center rounded-full border border-bone-300 bg-bone-50 text-ink-500 transition-colors duration-150 hover:border-moss-600 hover:bg-moss-700 hover:text-bone-50"
          >
            <Icon size={18} />
          </button>
        ))}
      </div>
    </div>
  );
}
