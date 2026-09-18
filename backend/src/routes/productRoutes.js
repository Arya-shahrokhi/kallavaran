import { Router } from 'express';
import * as c from '../controllers/productController.js';
import { adminOnly, optionalAuth, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { uploadImages } from '../middleware/upload.js';
import { writeLimiter } from '../middleware/rateLimiters.js';
import { idParam } from '../validators/common.js';
import { shortCache } from '../middleware/cache.js';
import {
  createProductSchema, listProductsSchema, reviewSchema, updateProductSchema,
} from '../validators/productValidators.js';

const router = Router();

router.get('/', shortCache, validate(listProductsSchema), c.listProducts);
router.post('/', protect, adminOnly, validate(createProductSchema), c.createProduct);
router.post('/upload', protect, adminOnly, writeLimiter, uploadImages, c.uploadProductImages);

router.get('/:id/reviews', shortCache, validate(idParam), c.listReviews);
router.post('/:id/reviews', protect, writeLimiter, validate({ ...idParam, ...reviewSchema }), c.addReview);

router.put('/:id', protect, adminOnly, validate({ ...idParam, ...updateProductSchema }), c.updateProduct);
router.delete('/:id', protect, adminOnly, validate(idParam), c.deleteProduct);

// slug یا id، آخرین مسیر تا با /upload تعارض نداشته باشد
router.get('/:key', shortCache, optionalAuth, c.getProduct);

export default router;
