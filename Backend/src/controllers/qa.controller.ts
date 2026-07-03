import { Request, Response, NextFunction } from 'express';
import * as qaService from '../services/qa.service';

export const getQAsByTopic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { topicId } = req.params;
    const qas = await qaService.getQAsByTopic(userId, topicId);
    
    res.status(200).json({
      success: true,
      data: qas,
    });
  } catch (error) {
    next(error);
  }
};

export const createQA = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { topicId } = req.params;
    const qa = await qaService.createQA(userId, topicId, req.body);
    
    res.status(201).json({
      success: true,
      data: qa,
    });
  } catch (error) {
    next(error);
  }
};

export const updateQA = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;
    const qa = await qaService.updateQA(userId, id, req.body);
    
    res.status(200).json({
      success: true,
      data: qa,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQA = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;
    await qaService.deleteQA(userId, id);
    
    res.status(200).json({
      success: true,
      message: 'QA item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
