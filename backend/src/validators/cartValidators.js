import { z } from 'zod';
import { numeric, objectId } from './common.js';

export const addToCartSchema = {
  body: z.object({ product: objectId, quantity: numeric().int().min(1).max(50).optional() }).strict(),
};

export const updateCartItemSchema = {
  body: z.object({ quantity: numeric('تعداد معتبر نیست').int().min(1).max(50) }).strict(),
  params: z.object({ itemId: objectId }),
};
