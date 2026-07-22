import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { validate } from '../middlewares/validate.middleware';
import { createNotificationSchema } from '../validations/notification.validation';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', notificationController.getNotifications);
router.post('/', validate(createNotificationSchema), notificationController.createNotification);
router.patch('/mark-read', notificationController.markAllAsRead);
router.delete('/', notificationController.clearNotifications);

export default router;
