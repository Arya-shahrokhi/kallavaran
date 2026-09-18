# عطاری مدرن | Attari Shop

فروشگاه آنلاین محصولات گیاهی و عطاری، Full-Stack با React + Node.js + MongoDB.

```
React (Vite + Tailwind + RTL)  →  REST API  →  Express + JWT  →  MongoDB (Mongoose)
```

## معماری

| لایه | تکنولوژی | نکته |
|---|---|---|
| Frontend | React 18، Vite، React Router 6، Tailwind، Axios، Swiper، React Icons | Mobile-first، RTL کامل |
| State | Context API + reducer (Auth / Cart / Wishlist / Toast) | برای این دامنه Redux اضافه‌کاری است |
| Backend | Express 4، JWT، bcrypt، Zod، Helmet، CORS، rate-limit، Morgan | Controller نازک + Service |
| DB | MongoDB + Mongoose | Index روی slug، category، price، createdAt، text search |
| Images | Cloudinary (اختیاری) با fallback به آپلود محلی | `CLOUDINARY_*` را خالی بگذارید تا محلی ذخیره شود |

### تصمیم‌های معماری (کوتاه)

1. **Access token کوتاه‌عمر + refresh token در cookie با httpOnly**: نگه‌داشتن JWT در localStorage در برابر XSS آسیب‌پذیر است.
2. **سبد خرید سمت سرور** با مالکیت `user` یا `guestId`: قیمت‌ها هنگام افزودن از DB خوانده می‌شوند، نه از کلاینت (جلوگیری از دست‌کاری قیمت).
3. **Snapshot محصول در Order**: سفارش باید تاریخی و تغییرناپذیر باشد؛ تغییر قیمت محصول نباید سفارش قدیمی را عوض کند.
4. **Validation با Zod در لایه route** و whitelist صریح فیلدها: جلوی Mass Assignment را می‌گیرد.
5. **`rating` و `reviewsCount` روی Product به‌صورت denormalized** و بازمحاسبه با aggregate پس از هر review: خواندن لیست محصولات نباید N+1 کوئری بزند.
6. **`paymentStatus` جدا از `orderStatus`** و یک `PaymentProvider` interface: افزودن زرین‌پال/آیدی‌پی بعداً فقط یک فایل adapter است.

## اجرا

```bash
# ۱. Backend
cd backend
npm install
cp .env.example .env      # مقادیر را پر کنید
npm run seed              # ۲۴ محصول + دسته‌بندی + کاربر + سفارش + نظر
npm run dev               # http://localhost:5000

# ۲. Frontend (ترمینال دوم)
cd frontend
npm install
cp .env.example .env
npm run dev               # http://localhost:5173
```

MongoDB باید در حال اجرا باشد: `mongod` محلی یا یک connection string از Atlas.

## Environment Variables

### backend/.env

| کلید | توضیح |
|---|---|
| `PORT` | پورت سرور (پیش‌فرض 5000) |
| `NODE_ENV` | development / production |
| `MONGO_URI` | مثل `mongodb://127.0.0.1:27017/attari` |
| `JWT_ACCESS_SECRET` | رشته تصادفی بلند (`openssl rand -hex 32`) |
| `JWT_REFRESH_SECRET` | رشته تصادفی بلند و **متفاوت** |
| `JWT_ACCESS_EXPIRES` | پیش‌فرض `15m` |
| `JWT_REFRESH_EXPIRES` | پیش‌فرض `30d` |
| `CLIENT_ORIGIN` | آدرس فرانت برای CORS، مثل `http://localhost:5173` |
| `ADMIN_EMAIL` | ایمیل ادمین seed |
| `ADMIN_PASSWORD` | رمز ادمین seed (هرگز commit نشود) |
| `ADMIN_PHONE` | موبایل ادمین seed |
| `CLOUDINARY_CLOUD_NAME` | اختیاری |
| `CLOUDINARY_API_KEY` | اختیاری |
| `CLOUDINARY_API_SECRET` | اختیاری |
| `SHIPPING_FLAT` | هزینه ارسال به تومان، پیش‌فرض 49000 |
| `FREE_SHIPPING_THRESHOLD` | آستانه ارسال رایگان، پیش‌فرض 800000 |

### frontend/.env

| کلید | توضیح |
|---|---|
| `VITE_API_URL` | پیش‌فرض `http://localhost:5000/api` |

## API

پاسخ موفق: `{ "success": true, "message": "...", "data": {...} }`
پاسخ خطا: `{ "success": false, "message": "...", "error": {...} }`

| Method | Endpoint | دسترسی |
|---|---|---|
| POST | `/api/auth/register` | public |
| POST | `/api/auth/login` | public |
| POST | `/api/auth/refresh` | cookie |
| POST | `/api/auth/logout` | user |
| GET | `/api/auth/me` | user |
| PUT | `/api/auth/me` | user |
| PUT | `/api/auth/me/password` | user |
| GET/POST/PUT/DELETE | `/api/auth/me/addresses/:id?` | user |
| GET | `/api/products` | public (search, filter, sort, paginate) |
| GET | `/api/products/:slugOrId` | public |
| POST/PUT/DELETE | `/api/products/:id?` | admin |
| GET | `/api/products/:id/reviews` | public |
| POST | `/api/products/:id/reviews` | user |
| DELETE | `/api/reviews/:id` | owner/admin |
| GET/POST/PUT/DELETE | `/api/categories/:id?` | read public، write admin |
| GET/POST/PUT/DELETE | `/api/cart/:itemId?` | user/guest |
| GET | `/api/wishlist` + POST/DELETE `/api/wishlist/:productId` | user |
| POST/GET | `/api/orders` | user |
| GET | `/api/orders/:id` | owner/admin |
| PUT | `/api/orders/:id/status` | admin |
| GET | `/api/users`, `/api/users/:id`, PUT, DELETE | admin |
| GET | `/api/admin/stats` | admin |
| GET | `/api/admin/orders`, `/api/admin/reviews` | admin |

Query محصولات: `?search=&category=&minPrice=&maxPrice=&minRating=&inStock=&discounted=&sort=newest|cheapest|expensive|popular|discount&page=1&limit=12`

## امنیت

bcrypt (cost 12)، JWT دو مرحله‌ای، RBAC، Zod validation، `express-mongo-sanitize` + `xss-clean`، Helmet، CORS محدود، rate limit عمومی و سخت‌گیرانه روی auth، محدودیت نوع/حجم آپلود، حذف `password` از تمام پاسخ‌ها، بدون هیچ secret داخل سورس.

## تصاویر

تصاویر محصول در `frontend/public/images/products/` نگه داشته می‌شوند و در seed با
هلپر `local('file-name')` به `/images/products/file-name.jpg` اشاره می‌کنند، نه به CDN بیرونی.
هر تصویر دو نسخه دارد: `.jpg` (fallback) و `.webp` (سبک‌تر، اول سرو می‌شود).

نمایش تصویر همیشه از `components/ui/SmartImage.jsx` می‌گذرد. این کامپوننت `onError`
دارد، پس لینک خراب به‌جای یک مستطیل خالی، placeholder «بدون تصویر» نشان می‌دهد.
هرگز `<img>` خام اضافه نکنید.

هر تصویر محلی در چند عرض ساخته شده است: `name-300.webp`، `name-500.webp`،
`name-800.webp` (و برای hero: ۸۰۰/۱۲۰۰/۱۸۰۰). `SmartImage` از این‌ها
`srcset` می‌سازد، پس موبایل نسخه‌ی کوچک را می‌گیرد نه تصویر تمام‌عرض را.

اقلام باقی‌مانده:
- ۱۵ محصول و ۸ دسته‌بندی هنوز به Unsplash هات‌لینک هستند و باید محلی شوند.
  (فعلاً حداقل با `fm=webp` و عرض واقعی درخواست می‌شوند، نه JPEG تمام‌عرض.)
- «عرق بهارنارنج» و «گلاب دو آتشه قمصر» فعلاً یک تصویر مشترک دارند.

## تغییرات این نسخه

### فایل‌هایی که خالی بودند و پروژه را از کار می‌انداختند

| فایل | مشکل |
|---|---|
| `backend/src/config/env.js` | خالی بود، در حالی که ۱۹ نقطه از بک‌اند `env.*` را می‌خواند |
| `backend/src/services/cartService.js` | خالی بود، `cartController` چهار تابع از آن import می‌کرد |
| `frontend/vite.config.js` | خالی بود: بدون code splitting، بدون proxy |
| `frontend/src/routes/AppRoutes.jsx` | خالی بود، یعنی هیچ مسیری تعریف نشده بود |
| `frontend/src/components/layout/Navbar.jsx` | خالی بود، `MainLayout` آن را رندر می‌کرد |
| `frontend/src/pages/Journal.jsx` | خالی بود، در حالی که ۴ لینک سایت به آن می‌رسید |

دو خرابی دیگر که با اجرا معلوم می‌شد:

- `utils/ApiError.js` فقط `export default` داشت، ولی **۹ فایل** آن را
  به شکل `import { ApiError }` می‌گرفتند، یعنی `undefined`. هر مسیر خطا
  با `TypeError` می‌شکست. الان هر دو شکل صادر می‌شود.
- `controllers/orderController.js` فقط `listOrders` و `updateOrderStatus`
  داشت، ولی `orderRoutes` به `createOrder`، `myOrders`، `getOrder` و
  `cancelOrder` هم اشاره می‌کرد. چهار تابع نوشته شد؛ ثبت سفارش موجودی را
  به‌صورت شرطی (`$gte`) کم می‌کند و در صورت شکست کامل rollback می‌شود.

### عملکرد

| تغییر | اثر |
|---|---|
| code splitting همه‌ی مسیرها با `lazy` | باندل صفحه‌ی اول شامل پنل مدیریت، Swiper و صفحه‌ی پرداخت نیست |
| `manualChunks` در ویت | react / router / carousel / icons جدا کش می‌شوند |
| تصاویر ریسپانسیو + webp | کارت محصول روی موبایل ~۲۰KB به‌جای ~۱۵۰KB، hero ~۴۵KB به‌جای ~۲۳۰KB |
| فونت غیربلاک‌کننده + حذف وزن ۳۰۰ | رندر اول منتظر CSS فونت نمی‌ماند |
| `preload` تصویر hero | عنصر LCP زودتر از کشف در DOM شروع می‌شود |
| تقسیم `CartContext` به data/actions | افزودن یک کالا دیگر همه‌ی کارت‌های گرید را رندر نمی‌کند |
| `Seo` با کلید سریال‌شده | `useEffect` در هر رندر تگ JSON-LD را حذف/اضافه نمی‌کند |
| شمارش معکوس فقط در دید | تیک هر ثانیه‌ای بیرون از دید و در تب پس‌زمینه متوقف می‌شود |
| کش دسته‌بندی‌ها در `sessionStorage` | ناوبری دوم منتظر شبکه نمی‌ماند |
| `Cache-Control` + ETag روی GETهای عمومی | مرور برگشتی با ۳۰۴ یا از کش مرورگر جواب می‌گیرد |
| `compression` به ابتدای صف منتقل شد | پاسخ‌های خطا و استاتیک هم فشرده می‌شوند |
| تنظیم استخر اتصال Mongo | کوئری‌ها زیر بار در صف انتظار اتصال نمی‌مانند |
| حذف `adminController-fixed.js` و `useDashboard-fixed.js` | دو نسخه‌ی تکراری از یک منطق |

### تعامل‌پذیری

- **هدر جدید**: چسبان، با اسکرول پایین جمع می‌شود و با اسکرول بالا برمی‌گردد.
  منوی کشویی دسته‌بندی‌ها، منوی حساب، نشان‌گر تعداد سبد با تپش کوتاه،
  کشوی موبایل، و جست‌وجو با `Ctrl/Cmd + K`.
- **کشوی سبد خرید**: بعد از «افزودن به سبد» باز می‌شود؛ تغییر تعداد و حذف
  بدون ترک صفحه. نوار پیشرفت «چقدر تا ارسال رایگان».
- **دکمه‌ی افزودن**: حالت لودینگ و تیک تأیید روی همان دکمه.
- **صفحه‌ی مجله**: فهرست با فیلتر موضوعی، صفحه‌ی مقاله، و لینک مقاله‌ی بعدی.
- **ظاهر شدن تدریجی** کارت‌ها با `IntersectionObserver`، با احترام به
  `prefers-reduced-motion`.
- **دکمه‌ی بازگشت به بالا** که فقط هنگام اسکرول به بالا ظاهر می‌شود.
- هوک‌های تازه در `hooks/index.js`: `useScrollDirection`، `useReveal`،
  `useInView`، `useMediaQuery`، `useDismiss`، `useHotkey`، `useSessionState`.
