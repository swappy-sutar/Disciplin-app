import { Request, Response, NextFunction } from 'express';
import { Review } from '../models/Review';
import { BadRequestError } from '../utils/custom-errors';

export const getReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit } = req.query;
    const filter = { isApproved: true };

    const reviewQuery = Review.find(filter).sort({ createdAt: -1 }).lean();

    if (page !== undefined || limit !== undefined) {
      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
      const skip = (pageNum - 1) * limitNum;

      const [reviews, total] = await Promise.all([
        reviewQuery.skip(skip).limit(limitNum),
        Review.countDocuments(filter),
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

    const reviews = await reviewQuery.limit(20);

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
