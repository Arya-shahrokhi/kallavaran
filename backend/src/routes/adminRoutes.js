import { Router } from 'express';
import * as admin from '../controllers/adminController.js';
import { listOrders } from '../controllers/orderController.js';
import { adminOnly, protect } from '../middleware/auth.js';

const router = Router();
router.use(protect, adminOnly);

router.get('/stats', admin.dashboardStats);
router.get('/products', admin.adminListProducts);
router.get('/orders', listOrders);
router.get('/reviews', admin.adminListReviews);

export default router;
