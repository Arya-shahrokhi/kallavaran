import { Router } from 'express';
import * as c from '../controllers/userController.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParam } from '../validators/common.js';
import { adminUpdateUserSchema } from '../validators/userValidators.js';

const router = Router();
router.use(protect, adminOnly);

router.get('/', c.listUsers);
router.get('/:id', validate(idParam), c.getUser);
router.put('/:id', validate({ ...idParam, ...adminUpdateUserSchema }), c.updateUser);
router.delete('/:id', validate(idParam), c.deleteUser);

export default router;
