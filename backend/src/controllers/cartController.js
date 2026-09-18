import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import { ApiError } from '../utils/ApiError.js';
import { assertPurchasable, buildCartPayload, cartOwner, getOrCreateCart } from '../services/cartService.js';

export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(cartOwner(req), req);
  return ok(res, { cart: await buildCartPayload(cart) }, 'سبد خرید');
});

export const addItem = asyncHandler(async (req, res) => {
  const { product: productId, quantity = 1 } = req.body;
  const cart = await getOrCreateCart(cartOwner(req), req);
  const existing = cart.items.find((i) => String(i.product) === String(productId));
  const nextQty = Math.min(50, (existing?.quantity || 0) + quantity);
  const product = await assertPurchasable(productId, nextQty);

  if (existing) existing.quantity = nextQty;
  else cart.items.push({ product: product._id, quantity: nextQty, priceAtAdd: product.finalPrice() });
  await cart.save();

  return ok(res, { cart: await buildCartPayload(cart) }, 'به سبد خرید اضافه شد');
});

export const updateItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(cartOwner(req), req);
  const item = cart.items.id(req.params.itemId);
  if (!item) throw ApiError.notFound('این محصول در سبد شما نیست');
  await assertPurchasable(item.product, req.body.quantity);
  item.quantity = req.body.quantity;
  await cart.save();
  return ok(res, { cart: await buildCartPayload(cart) }, 'سبد خرید به‌روزرسانی شد');
});

export const removeItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(cartOwner(req), req);
  const item = cart.items.id(req.params.itemId);
  if (!item) throw ApiError.notFound('این محصول در سبد شما نیست');
  item.deleteOne();
  await cart.save();
  return ok(res, { cart: await buildCartPayload(cart) }, 'از سبد خرید حذف شد');
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(cartOwner(req), req);
  cart.items = [];
  await cart.save();
  return ok(res, { cart: await buildCartPayload(cart) }, 'سبد خرید خالی شد');
});
