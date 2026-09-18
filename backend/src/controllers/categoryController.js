import { Category, Product } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/response.js';
import { uniqueSlug } from '../utils/slug.js';
import { pick } from '../utils/pick.js';

const EDITABLE = ['name', 'description', 'icon', 'image', 'parent', 'order', 'isActive'];

export const listCategories = asyncHandler(async (req, res) => {
  const includeInactive = req.user?.role === 'ADMIN' && req.query.all === 'true';
  const categories = await Category.find(includeInactive ? {} : { isActive: true }).sort({ order: 1, name: 1 }).lean();
  // شمارش محصولات با یک aggregate، نه یک کوئری به ازای هر دسته
  const counts = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const map = new Map(counts.map((c) => [String(c._id), c.count]));
  return ok(res, { categories: categories.map((c) => ({ ...c, productsCount: map.get(String(c._id)) || 0 })) }, 'دسته‌بندی‌ها');
});

export const createCategory = asyncHandler(async (req, res) => {
  const data = pick(req.body, EDITABLE);
  data.slug = await uniqueSlug(Category, data.name);
  const category = await Category.create(data);
  return created(res, { category }, 'دسته‌بندی ایجاد شد');
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('دسته‌بندی پیدا نشد');
  const data = pick(req.body, EDITABLE);
  if (data.name && data.name !== category.name) data.slug = await uniqueSlug(Category, data.name, category._id);
  category.set(data);
  await category.save();
  return ok(res, { category }, 'دسته‌بندی به‌روزرسانی شد');
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const inUse = await Product.countDocuments({ category: req.params.id });
  if (inUse) throw ApiError.badRequest(`${inUse} محصول در این دسته‌بندی است، ابتدا آن‌ها را منتقل کنید`);
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw ApiError.notFound('دسته‌بندی پیدا نشد');
  return ok(res, {}, 'دسته‌بندی حذف شد');
});
