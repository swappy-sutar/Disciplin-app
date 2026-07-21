import { Request, Response, NextFunction } from 'express';
import { Review } from '../models/Review';
import { BadRequestError } from '../utils/custom-errors';

export const getReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reviews = await Review.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, role, comment, rating, avatarUrl } = req.body;

    if (!name || !role || !comment) {
      throw new BadRequestError('Name, role, and comment are required.');
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
  } catch (error) {
    next(error);
  }
};
