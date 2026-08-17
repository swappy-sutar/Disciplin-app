import { Request, Response, NextFunction } from 'express';
import { TimetableBlock } from '../models/TimetableBlock';
import { NotFoundError } from '../utils/custom-errors';
import { getOrCreateBlocks, ensureMetaExists } from '../services/timetable.service';
import { invalidateDashboardCache } from '../utils/cache';

export const getBlocks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const date = req.query.date as string;

    const blocks = await getOrCreateBlocks(userId, date);

    res.status(200).json({
      success: true,
      data: blocks,
    });
  } catch (error) {
    next(error);
  }
};

export const createBlock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { date, startTime, endTime, label, tag, order } = req.body;

    await ensureMetaExists(userId, date);

    const block = new TimetableBlock({
      userId,
      date,
      startTime,
      endTime,
      label,
      tag,
      order,
    });

    await block.save();
    invalidateDashboardCache(userId);

    res.status(201).json({
      success: true,
      data: block,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBlock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const block = await TimetableBlock.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!block) {
      throw new NotFoundError('Timetable block not found');
    }

    if (userId) invalidateDashboardCache(userId);

    res.status(200).json({
      success: true,
      data: block,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBlock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const block = await TimetableBlock.findOneAndDelete({ _id: id, userId });

    if (!block) {
      throw new NotFoundError('Timetable block not found');
    }

    if (userId) invalidateDashboardCache(userId);

    res.status(200).json({
      success: true,
      message: 'Timetable block deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const copyTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { sourceDate, targetDate } = req.body;

    // Delete existing blocks on target date
    await TimetableBlock.deleteMany({ userId, date: targetDate });

    // Fetch source blocks
    const sourceBlocks = await TimetableBlock.find({ userId, date: sourceDate }).lean();

    // Copy to target date
    const copiedBlocks = sourceBlocks.map((block) => {
      return new TimetableBlock({
        userId,
        date: targetDate,
        startTime: block.startTime,
        endTime: block.endTime,
        label: block.label,
        tag: block.tag,
        isDone: false, // Reset completion status
        order: block.order,
      });
    });

    if (copiedBlocks.length > 0) {
      await TimetableBlock.insertMany(copiedBlocks);
    }

    if (userId) invalidateDashboardCache(userId);

    res.status(200).json({
      success: true,
      message: `Successfully copied ${copiedBlocks.length} blocks to ${targetDate}`,
      data: copiedBlocks,
    });
  } catch (error) {
    next(error);
  }
};
