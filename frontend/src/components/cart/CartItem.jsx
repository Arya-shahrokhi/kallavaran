import { Link } from 'react-router-dom';
import { FiAlertCircle, FiTrash2 } from 'react-icons/fi';
import QuantityStepper from '../ui/QuantityStepper.jsx';
import Spinner from '../ui/Spinner.jsx';
import { toFa, toman } from '../../utils/format.js';
import { useCart } from '../../context/CartContext.jsx';
import SmartImage from '../ui/SmartImage.jsx';

export default function CartItem({ item }) {
  const { updateItem, removeItem, pendingId } = useCart();
  const busy = pendingId === item._id;

  return (
    <article className={`flex gap-4 py-5 transition-opacity ${busy ? 'opacity-60' : ''}`}>
      <Link to={`/products/${item.product.slug}`} className="shrink-0">
        <SmartImage
          src={item.product.image} alt={item.product.name} loading="lazy" width="96" height="120"
          className="size-20 rounded-xl object-cover sm:size-24"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold sm:text-[0.95rem]">
              <Link to={`/products/${item.product.slug}`} className="hover:text-moss-700">{item.product.name}</Link>
            </h3>
            <p className="num mt-1 text-xs text-ink-400">
              {toFa(item.product.weight)} {item.product.unit}
              {item.discountPercent > 0 && <span className="mr-2 text-berry-600">٪{toFa(item.discountPercent)} تخفیف</span>}
            </p>
          </div>
          <button onClick={() => removeItem(item._id)} disabled={busy} aria-label={`حذف ${item.product.name}`} className="shrink-0 rounded-lg p-2 text-ink-300 transition-colors hover:bg-berry-100 hover:text-berry-600">
            {busy ? <Spinner size={16} /> : <FiTrash2 size={16} />}
          </button>
        </div>

        {item.priceChanged && (
          <p className="flex items-center gap-1.5 text-2xs text-saffron-600">
            <FiAlertCircle size={13} /> قیمت این کالا از زمان افزودن تغییر کرده است
          </p>
        )}
        {item.product.stock <= 5 && (
          <p className="num text-2xs text-berry-600">تنها {toFa(item.product.stock)} عدد در انبار مانده</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-1">
          <QuantityStepper
            size="sm"
            value={item.quantity}
            max={Math.min(50, item.product.stock)}
            disabled={busy}
            onChange={(q) => updateItem(item._id, q)}
          />
          <div className="text-left">
            <p className="num text-sm font-bold sm:text-base">{toman(item.lineTotal)}</p>
            {item.quantity > 1 && <p className="num text-2xs text-ink-400">واحدی {toman(item.unitPrice)}</p>}
          </div>
        </div>
      </div>
    </article>
  );
}
