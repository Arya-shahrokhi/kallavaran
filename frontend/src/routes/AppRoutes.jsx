import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import Spinner from '../components/ui/Spinner.jsx';

/**
 * این فایل خالی بود. حالا هر مسیر با lazy جدا می‌شود.
 *
 * چرا مهم است: قبل از این، هر بازدیدکننده‌ی صفحه‌ی خانه کل کد پنل مدیریت
 * (داشبورد، نمودارها، فرم محصول) و صفحه‌ی پرداخت را هم دانلود می‌کرد.
 * حالا صفحه‌ی خانه فقط چیزی را می‌گیرد که رندر می‌کند و بقیه در پس‌زمینه
 * و فقط در صورت نیاز می‌آید.
 *
 * صفحه‌ی خانه و لیست محصولات lazy نیستند: مسیر ورود اصلی سایت‌اند و
 * آبشار درخواست اضافه برای‌شان ضرر است.
 */
import Home from '../pages/Home.jsx';
import Products from '../pages/Products.jsx';
import PremiumProducts from '../pages/PremiumProducts.jsx';

// فروشگاه
const ProductDetails = lazy(() => import('../pages/ProductDetails.jsx'));
const Cart = lazy(() => import('../pages/Cart.jsx'));
const Checkout = lazy(() => import('../pages/Checkout.jsx'));
const Journal = lazy(() => import('../pages/Journal.jsx'));
const StaticPage = lazy(() => import('../pages/StaticPage.jsx'));
const NotFound = lazy(() => import('../pages/NotFound.jsx'));

// احراز هویت
const Login = lazy(() => import('../pages/Login.jsx'));
const Register = lazy(() => import('../pages/Register.jsx'));

// حساب کاربری
const AccountLayout = lazy(() => import('../layouts/AccountLayout.jsx'));
const Profile = lazy(() => import('../pages/account/Profile.jsx'));
const Orders = lazy(() => import('../pages/account/Orders.jsx'));
const OrderDetail = lazy(() => import('../pages/account/OrderDetail.jsx'));
const Wishlist = lazy(() => import('../pages/account/Wishlist.jsx'));
const Addresses = lazy(() => import('../pages/account/Addresses.jsx'));
const Security = lazy(() => import('../pages/account/Security.jsx'));

// پنل مدیریت: سنگین‌ترین بخش و کمترین تعداد کاربر، پس کاملاً جدا
const AdminLayout = lazy(() => import('../layouts/AdminLayout.jsx'));
const Dashboard = lazy(() => import('../pages/admin/Dashboard.jsx'));
const AdminProducts = lazy(() => import('../pages/admin/AdminProducts.jsx'));
const ProductForm = lazy(() => import('../pages/admin/ProductForm.jsx'));
const AdminCategories = lazy(() => import('../pages/admin/AdminCategories.jsx'));
const AdminOrders = lazy(() => import('../pages/admin/AdminOrders.jsx'));
const AdminOrderDetail = lazy(() => import('../pages/admin/AdminOrderDetail.jsx'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers.jsx'));
const AdminReviews = lazy(() => import('../pages/admin/AdminReviews.jsx'));

/** لودر مسیر: ارتفاع ثابت دارد تا هنگام جایگزینی، صفحه نپرد (CLS صفر). */
function RouteFallback() {
  return (
    <div className="grid min-h-[60dvh] place-items-center text-moss-600" role="status" aria-live="polite">
      <Spinner size={28} />
      <span className="sr-only">در حال بارگذاری صفحه</span>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />

          <Route path="products" element={<Products />} />
          <Route path="premium-products" element={<PremiumProducts />} />
          <Route path="products/:slug" element={<ProductDetails />} />
          <Route path="category/:slug" element={<Products />} />

          <Route path="cart" element={<Cart />} />

          <Route path="journal" element={<Journal />} />
          <Route path="journal/:slug" element={<Journal />} />

          <Route path="about" element={<StaticPage page="about" />} />
          <Route path="contact" element={<StaticPage page="contact" />} />
          <Route path="terms" element={<StaticPage page="terms" />} />
          <Route path="privacy" element={<StaticPage page="privacy" />} />

          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* نیازمند ورود */}
          <Route element={<ProtectedRoute />}>
            <Route path="checkout" element={<Checkout />} />
            <Route path="account" element={<AccountLayout />}>
              <Route index element={<Profile />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="addresses" element={<Addresses />} />
              <Route path="security" element={<Security />} />
            </Route>
          </Route>

          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* پنل مدیریت، بیرون از MainLayout: هدر و فوتر فروشگاه را ندارد */}
        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
