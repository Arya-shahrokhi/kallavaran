import { Router } from 'express';
import { deleteReview } from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParam } from '../validators/common.js';

const router = Router();

router.delete('/:id', protect, validate(idParam), deleteReview);

export default router;
