import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/ui/Spinner.jsx';

export default function ProtectedRoute({ requireAdmin = false }) {
  const { isAuthenticated, isAdmin, booting } = useAuth();
  const location = useLocation();

  if (booting) {
    return (
      <div className="grid min-h-[60dvh] place-items-center text-moss-600">
        <Spinner size={30} />
        <span className="sr-only">در حال بررسی نشست</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // ادمین‌بودن شرط ورود به داشبورد است؛ کاربر عادی به پنل خودش می‌رود
  if (requireAdmin && !isAdmin) return <Navigate to="/account" replace />;

  return <Outlet />;
}
