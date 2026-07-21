import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { mongoIdParamSchema, updateUserRoleSchema, toggleReviewApprovalSchema } from '../validations/admin.validation';
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
router.patch('/users/:id/role', validate(updateUserRoleSchema), updateUserRole);
router.delete('/users/:id', validate(mongoIdParamSchema), deleteUser);

// Review Management
router.get('/reviews', getAllReviewsAdmin);
router.patch('/reviews/:id/approve', validate(toggleReviewApprovalSchema), toggleReviewApproval);
router.delete('/reviews/:id', validate(mongoIdParamSchema), deleteReview);

export default router;
