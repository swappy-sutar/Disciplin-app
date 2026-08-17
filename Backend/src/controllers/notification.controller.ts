import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/Notification';

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { page, limit } = req.query;

    const query = Notification.find({ userId }).sort({ createdAt: -1 }).lean();

    if (page !== undefined || limit !== undefined) {
      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
      const skip = (pageNum - 1) * limitNum;

      const [notifications, total] = await Promise.all([
        query.skip(skip).limit(limitNum),
        Notification.countDocuments({ userId }),
      ]);

      return res.status(200).json({
        success: true,
        data: notifications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }

    const notifications = await query;

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { title, message, type } = req.body;

    const notification = new Notification({
      userId,
      title,
      message,
      type: type || 'system',
    });

    await notification.save();

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

export const clearNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    await Notification.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: 'All notifications cleared',
    });
  } catch (error) {
    next(error);
  }
};
