import { Request, Response, NextFunction } from 'express';
import { Topic } from '../models/Topic';
import { NotFoundError } from '../utils/custom-errors';

export const getTopics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { category } = req.query;

    const filter: any = { userId };
    if (category) {
      filter.category = category;
    }

    const topics = await Topic.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: topics,
    });
  } catch (error) {
    next(error);
  }
};

export const createTopic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { title, category, subTopics } = req.body;

    const topic = new Topic({
      userId,
      title,
      category,
      subTopics,
    });

    await topic.save();

    res.status(201).json({
      success: true,
      data: topic,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTopic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;

    // Find the topic first
    const topic = await Topic.findOne({ _id: id, userId });
    if (!topic) {
      throw new NotFoundError('Topic not found');
    }

    // Update fields manually to trigger pre('save') hook for progressPercent
    if (req.body.title !== undefined) topic.title = req.body.title;
    if (req.body.category !== undefined) topic.category = req.body.category;
    if (req.body.subTopics !== undefined) {
      topic.subTopics = req.body.subTopics;
    }
    // If progressPercent is updated manually and there are no subtopics, let it be set directly
    if (req.body.progressPercent !== undefined && (!req.body.subTopics || req.body.subTopics.length === 0)) {
      topic.progressPercent = req.body.progressPercent;
    }

    await topic.save();

    res.status(200).json({
      success: true,
      data: topic,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTopic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;

    const topic = await Topic.findOneAndDelete({ _id: id, userId });

    if (!topic) {
      throw new NotFoundError('Topic not found');
    }

    res.status(200).json({
      success: true,
      message: 'Topic deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
