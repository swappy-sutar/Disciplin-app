import { Request, Response, NextFunction } from 'express';
import * as prepService from '../services/interview-prep.service';

export const getTopicDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { topicId } = req.params;
    const details = await prepService.getTopicDetail(userId, topicId);
    
    res.status(200).json({
      success: true,
      data: details,
    });
  } catch (error) {
    next(error);
  }
};

export const getTopicReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { topicId } = req.params;
    const filterWeak = req.query.filter === 'weak';
    
    const reviewData = await prepService.getTopicReview(userId, topicId, filterWeak);
    
    res.status(200).json({
      success: true,
      data: reviewData,
    });
  } catch (error) {
    next(error);
  }
};
