import { Request, Response } from 'express';
import { User } from '../models/User';
import { Review } from '../models/Review';
import { Habit } from '../models/Habit';
import { Application } from '../models/Application';
import { WeeklyGoal } from '../models/WeeklyGoal';

// Get Overview Stats for Admin Dashboard
export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Registered Users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    let query: any = {};

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
      ];
    }

    const users = await User.find(query)
      .select('-passwordHash -passwordResetToken -verificationToken -hashedRefreshToken')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update User Role (Admin / Moderator / User / Premium)
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'moderator', 'user', 'premium'].includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role specified.' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.json({
      success: true,
      data: user,
      message: `User role updated to ${role} successfully.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete User Account
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Reviews (Both Approved & Pending)
export const getAllReviewsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve or Unapprove Review
export const toggleReviewApproval = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const review = await Review.findByIdAndUpdate(
      id,
      { isApproved: Boolean(isApproved) },
      { new: true }
    );

    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found.' });
      return;
    }

    res.json({
      success: true,
      data: review,
      message: `Review ${review.isApproved ? 'approved' : 'unapproved'} successfully.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Review
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found.' });
      return;
    }

    res.json({
      success: true,
      message: 'Review deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
