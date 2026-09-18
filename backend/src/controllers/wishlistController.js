import { Wishlist } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';

const SELECT = 'name slug price oldPrice discount rating reviewsCount images stock unit';

export const getWishlist = asyncHandler(async (req, res) => {
  const list = await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    { $setOnInsert: { products: [] } },
    { new: true, upsert: true },
  ).populate('products', SELECT);
  return ok(res, { products: list.products }, 'علاقه‌مندی‌ها');
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const list = await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    { $setOnInsert: { products: [] } },
    { new: true, upsert: true },
  );
  const index = list.products.findIndex((p) => String(p) === productId);
  const added = index === -1;
  if (added) list.products.push(productId);
  else list.products.splice(index, 1);
  await list.save();
  await list.populate('products', SELECT);
  return ok(res, { products: list.products, added }, added ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها حذف شد');
});
