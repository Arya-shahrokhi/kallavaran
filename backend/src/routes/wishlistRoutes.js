import { Router } from 'express';
import * as c from '../controllers/wishlistController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';
import { objectId } from '../validators/common.js';

const router = Router();
router.use(protect);

router.get('/', c.getWishlist);
router.post('/:productId', validate({ params: z.object({ productId: objectId }) }), c.toggleWishlist);
router.delete('/:productId', validate({ params: z.object({ productId: objectId }) }), c.toggleWishlist);

export default router;
