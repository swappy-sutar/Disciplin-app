import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllReviewsAdmin,
  toggleReviewApproval,
  deleteReview,
} from '../controllers/adminController';

const router = Router();

// Protect all admin routes
router.use(protect);
router.use(restrictTo('admin'));

// Stats & Dashboard
router.get('/stats', getAdminStats);

// User Management
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Review Management
router.get('/reviews', getAllReviewsAdmin);
router.patch('/reviews/:id/approve', toggleReviewApproval);
router.delete('/reviews/:id', deleteReview);

export default router;
