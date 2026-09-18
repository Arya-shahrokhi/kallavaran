import { Router } from 'express';
import * as c from '../controllers/categoryController.js';
import { adminOnly, optionalAuth, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParam } from '../validators/common.js';
import { longCache } from '../middleware/cache.js';
import { createCategorySchema, updateCategorySchema } from '../validators/categoryValidators.js';

const router = Router();

router.get('/', longCache, optionalAuth, c.listCategories);
router.post('/', protect, adminOnly, validate(createCategorySchema), c.createCategory);
router.put('/:id', protect, adminOnly, validate({ ...idParam, ...updateCategorySchema }), c.updateCategory);
router.delete('/:id', protect, adminOnly, validate(idParam), c.deleteCategory);

export default router;
