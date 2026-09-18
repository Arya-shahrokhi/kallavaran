import { Router } from 'express';
import * as c from '../controllers/cartController.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { addToCartSchema, updateCartItemSchema } from '../validators/cartValidators.js';

const router = Router();

// سبد برای مهمان هم کار می‌کند: هدر x-guest-id
router.use(optionalAuth);

router.get('/', c.getCart);
router.post('/', validate(addToCartSchema), c.addItem);
router.put('/:itemId', validate(updateCartItemSchema), c.updateItem);
router.delete('/:itemId', c.removeItem);
router.delete('/', c.clearCart);

export default router;
