import { Request, Response, NextFunction } from 'express';
import * as codingService from '../services/coding.service';

export const getCodingsByTopic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { topicId } = req.params;
    const codings = await codingService.getCodingsByTopic(userId, topicId);
    
    res.status(200).json({
      success: true,
      data: codings,
    });
  } catch (error) {
    next(error);
  }
};

export const createCoding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { topicId } = req.params;
    const coding = await codingService.createCoding(userId, topicId, req.body);
    
    res.status(201).json({
      success: true,
      data: coding,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCoding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;
    const coding = await codingService.updateCoding(userId, id, req.body);
    
    res.status(200).json({
      success: true,
      data: coding,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCoding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;
    await codingService.deleteCoding(userId, id);
    
    res.status(200).json({
      success: true,
      message: 'Coding question deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
