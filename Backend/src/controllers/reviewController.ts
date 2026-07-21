import { Request, Response } from 'express';
import { Review } from '../models/Review';

export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, role, comment, rating, avatarUrl } = req.body;

    if (!name || !role || !comment) {
      res.status(400).json({
        success: false,
        message: 'Name, role, and comment are required.',
      });
      return;
    }

    const review = await Review.create({
      name,
      role,
      comment,
      rating: rating ? Math.min(5, Math.max(1, Number(rating))) : 5,
      avatarUrl: avatarUrl || '',
      userId: (req.user as any)?.id || (req.user as any)?.userId || undefined,
      isApproved: true,
    });

    res.status(201).json({
      success: true,
      data: review,
      message: 'Thank you! Your review has been submitted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
