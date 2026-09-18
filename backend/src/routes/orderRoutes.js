import { Router } from 'express';
import * as c from '../controllers/orderController.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { writeLimiter } from '../middleware/rateLimiters.js';
import { idParam } from '../validators/common.js';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/orderValidators.js';

const router = Router();
router.use(protect);

router.post('/', writeLimiter, validate(createOrderSchema), c.createOrder);
router.get('/', c.myOrders);
router.get('/:id', validate(idParam), c.getOrder);
router.put('/:id/cancel', validate(idParam), c.cancelOrder);
router.put('/:id/status', adminOnly, validate({ ...idParam, ...updateOrderStatusSchema }), c.updateOrderStatus);

export default router;
