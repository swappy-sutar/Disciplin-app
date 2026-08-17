import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Review } from '../models/Review';
import { Habit } from '../models/Habit';
import { Application } from '../models/Application';
import { WeeklyGoal } from '../models/WeeklyGoal';
import { NotFoundError, BadRequestError } from '../utils/custom-errors';

// Get Overview Stats for Admin Dashboard
export const getAdminStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      totalUsers,
      totalHabits,
      totalReviews,
      pendingReviews,
      totalApplications,
      totalGoals
    ] = await Promise.all([
      User.countDocuments(),
      Habit.countDocuments(),
      Review.countDocuments(),
      Review.countDocuments({ isApproved: false }),
      Application.countDocuments(),
      WeeklyGoal.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalHabits,
        totalReviews,
        pendingReviews,
        totalApplications,
        totalGoals,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get All Registered Users
export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, page, limit } = req.query;
    let query: any = {};

    if (search) {
      // Escape special regex characters to prevent ReDoS injection
      const sanitizedSearch = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(sanitizedSearch, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
      ];
    }

    const userQuery = User.find(query)
      .select('-passwordHash -passwordResetToken -verificationToken -hashedRefreshToken')
      .sort({ createdAt: -1 })
      .lean();

    if (page !== undefined || limit !== undefined) {
      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
      const skip = (pageNum - 1) * limitNum;

      const [users, total] = await Promise.all([
        userQuery.skip(skip).limit(limitNum),
        User.countDocuments(query),
      ]);

      res.json({
        success: true,
        data: users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
      return;
    }

    const users = await userQuery;

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// Update User Role (Admin / Moderator / User / Premium)
export const updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'moderator', 'user', 'premium'].includes(role)) {
      throw new BadRequestError('Invalid role specified.');
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    res.json({
      success: true,
      data: user,
      message: `User role updated to ${role} successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// Delete User Account
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    // Clean up user data
    await Promise.all([
      Habit.deleteMany({ userId: id }),
      Application.deleteMany({ userId: id }),
      WeeklyGoal.deleteMany({ userId: id }),
      Review.deleteMany({ userId: id }),
    ]);

    res.json({
      success: true,
      message: 'User and all associated data deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Get All Reviews (Both Approved & Pending)
export const getAllReviewsAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit } = req.query;
    const reviewQuery = Review.find().sort({ createdAt: -1 }).lean();

    if (page !== undefined || limit !== undefined) {
      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
      const skip = (pageNum - 1) * limitNum;

      const [reviews, total] = await Promise.all([
        reviewQuery.skip(skip).limit(limitNum),
        Review.countDocuments(),
      ]);

      res.json({
        success: true,
        data: reviews,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
      return;
    }

    const reviews = await reviewQuery;

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// Approve or Unapprove Review
export const toggleReviewApproval = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const review = await Review.findByIdAndUpdate(
      id,
      { isApproved: Boolean(isApproved) },
      { new: true }
    );

    if (!review) {
      throw new NotFoundError('Review not found.');
    }

    res.json({
      success: true,
      data: review,
      message: `Review ${review.isApproved ? 'approved' : 'unapproved'} successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Review
export const deleteReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      throw new NotFoundError('Review not found.');
    }

    res.json({
      success: true,
      message: 'Review deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
