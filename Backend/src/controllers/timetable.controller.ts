import { Request, Response, NextFunction } from 'express';
import { TimetableBlock } from '../models/TimetableBlock';
import { NotFoundError } from '../utils/custom-errors';

export const getBlocks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { date } = req.query;

    const blocks = await TimetableBlock.find({ userId, date }).sort({ order: 1, startTime: 1 });

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
    const userId = req.user?.id;
    const { date, startTime, endTime, label, tag, order } = req.body;

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
    const sourceBlocks = await TimetableBlock.find({ userId, date: sourceDate });

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

    res.status(200).json({
      success: true,
      message: `Successfully copied ${copiedBlocks.length} blocks to ${targetDate}`,
      data: copiedBlocks,
    });
  } catch (error) {
    next(error);
  }
};
