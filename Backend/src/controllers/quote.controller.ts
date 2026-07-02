import { Request, Response, NextFunction } from 'express';
import { Quote } from '../models/Quote';
import { NotFoundError } from '../utils/custom-errors';

const getHashIndex = (str: string, max: number): number => {
  if (max <= 0) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % max;
};

export const getTodayQuote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];

    // Find all quotes available to this user (global quotes OR user's custom quotes)
    const quotes = await Quote.find({
      $or: [{ isCustom: false }, { isCustom: true, userId }],
    });

    if (quotes.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          text: 'Make today your masterpiece.',
          author: 'John Wooden',
          isFavorite: false,
          isCustom: false,
        },
      });
    }

    const index = getHashIndex(dateStr, quotes.length);
    const todayQuote = quotes[index];

    res.status(200).json({
      success: true,
      data: todayQuote,
    });
  } catch (error) {
    next(error);
  }
};

export const createQuote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { text, author } = req.body;

    const quote = new Quote({
      text,
      author,
      isCustom: true,
      userId,
    });

    await quote.save();

    res.status(201).json({
      success: true,
      data: quote,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;

    // Find quote (either global or custom for this user)
    const quote = await Quote.findOne({
      _id: id,
      $or: [{ isCustom: false }, { isCustom: true, userId }],
    });

    if (!quote) {
      throw new NotFoundError('Quote not found');
    }

    quote.isFavorite = !quote.isFavorite;
    await quote.save();

    res.status(200).json({
      success: true,
      data: quote,
    });
  } catch (error) {
    next(error);
  }
};
