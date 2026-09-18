import { FiRotateCcw, FiWifiOff } from 'react-icons/fi';
import Button from './Button.jsx';

export default function ErrorState({ message = 'دریافت اطلاعات ممکن نشد', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-berry-100 bg-berry-100/40 px-6 py-14 text-center">
      <FiWifiOff className="text-berry-600" size={30} />
      <div>
        <p className="font-semibold text-ink-900">مشکلی پیش آمد</p>
        <p className="mt-1.5 text-sm text-ink-500">{message}</p>
      </div>
      {onRetry && <Button variant="outline" size="sm" icon={FiRotateCcw} onClick={onRetry}>تلاش دوباره</Button>}
    </div>
  );
}
