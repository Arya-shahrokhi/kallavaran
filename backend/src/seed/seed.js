import { env } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { Cart, Category, Order, Product, Review, User, Wishlist } from '../models/index.js';
import { toSlug } from '../utils/slug.js';
import { categories, products, seedReviews, seedUsers } from './data.js';

const destroy = process.argv.includes('--destroy');

const wipe = async () => {
  await Promise.all([
    User.deleteMany({}), Product.deleteMany({}), Category.deleteMany({}),
    Order.deleteMany({}), Review.deleteMany({}), Cart.deleteMany({}), Wishlist.deleteMany({}),
  ]);
  console.log('[seed] داده‌های قبلی پاک شد');
};

const run = async () => {
  await connectDB();
  await wipe();

  if (destroy) {
    console.log('[seed] فقط پاکسازی انجام شد');
    return;
  }

  if (!env.admin.email || !env.admin.password) {
    throw new Error('ADMIN_EMAIL و ADMIN_PASSWORD را در .env تنظیم کنید (هرگز در سورس هاردکد نکنید)');
  }

  const admin = await User.create({
    name: 'مدیر فروشگاه',
    email: env.admin.email,
    phone: env.admin.phone || '09120000000',
    password: env.admin.password,
    role: 'ADMIN',
  });
  console.log(`[seed] ادمین ساخته شد: ${admin.email}`);

  const users = await User.create(seedUsers.map((u) => ({
    ...u,
    addresses: [{
      title: 'خانه', receiver: u.name, phone: u.phone, province: 'تهران', city: 'تهران',
      postalCode: '1234567890', line: 'خیابان ولیعصر، کوچه نهم، پلاک ۱۲، واحد ۳', isDefault: true,
    }],
  })));

  const categoryDocs = await Category.create(categories.map((c) => ({ ...c, slug: toSlug(c.name) })));
  const catMap = new Map(categoryDocs.map((c) => [c.name, c._id]));

  const productDocs = await Product.create(products.map((p) => ({
    ...p,
    slug: toSlug(p.name),
    category: catMap.get(p.category),
    shortDescription: p.shortDescription,
    soldCount: Math.floor(Math.random() * 220),
  })));
  console.log(`[seed] ${productDocs.length} محصول در ${categoryDocs.length} دسته‌بندی ثبت شد`);

  // نظرات
  let r = 0;
  for (const product of productDocs.slice(0, 12)) {
    for (const user of users.slice(0, 1 + (r % 3))) {
      await Review.create({ ...seedReviews[r % seedReviews.length], product: product._id, user: user._id });
      r++;
    }
  }
  console.log(`[seed] ${r} نظر ثبت شد`);

  // سفارش‌ها
  const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  for (let i = 0; i < 6; i++) {
    const user = users[i % users.length];
    const picked = [productDocs[i], productDocs[(i + 5) % productDocs.length]];
    const items = picked.map((p, idx) => {
      const unitPrice = p.finalPrice();
      const quantity = idx + 1;
      return {
        product: p._id, name: p.name, slug: p.slug, image: p.images?.[0]?.url,
        unitPrice, quantity, lineTotal: unitPrice * quantity,
      };
    });
    const subtotal = items.reduce((s, it) => s + it.lineTotal, 0);
    const shippingCost = subtotal >= env.shipping.freeThreshold ? 0 : env.shipping.flat;
    const status = statuses[i % statuses.length];
    await Order.create({
      user: user._id,
      items,
      shippingAddress: {
        receiver: user.name, phone: user.phone, province: 'تهران', city: 'تهران',
        postalCode: '1234567890', line: 'خیابان ولیعصر، کوچه نهم، پلاک ۱۲',
      },
      subtotal, discount: 0, shippingCost, total: subtotal + shippingCost,
      orderStatus: status,
      paymentStatus: status === 'DELIVERED' ? 'PAID' : 'UNPAID',
      statusHistory: [{ status: 'PENDING' }, ...(status !== 'PENDING' ? [{ status }] : [])],
      createdAt: new Date(Date.now() - i * 3 * 24 * 3600 * 1000),
    });
  }
  console.log('[seed] ۶ سفارش نمونه ثبت شد');

  // علاقه‌مندی و سبد نمونه
  await Wishlist.create({ user: users[0]._id, products: [productDocs[0]._id, productDocs[9]._id] });
  await Cart.create({
    user: users[0]._id,
    items: [{ product: productDocs[5]._id, quantity: 2, priceAtAdd: productDocs[5].finalPrice() }],
  });

  console.log('[seed] تمام شد. با ایمیل ادمین و رمز داخل .env وارد شوید.');
};

run()
  .catch((err) => {
    console.error('[seed] خطا:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });
