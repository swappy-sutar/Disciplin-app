import { Request, Response, NextFunction } from 'express';
import { WeeklyGoal } from '../models/WeeklyGoal';
import { NotFoundError } from '../utils/custom-errors';

const getMondayStr = (d: Date = new Date()): string => {
  const day = d.getDay();
  // Adjust when day is Sunday (0) to get previous Monday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
};

export const getGoals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const week = (req.query.week as string) || getMondayStr();

    const goals = await WeeklyGoal.find({ userId, weekStartDate: week });

    res.status(200).json({
      success: true,
      data: goals,
    });
  } catch (error) {
    next(error);
  }
};

export const createGoal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { weekStartDate, title, dueDay } = req.body;

    const goal = new WeeklyGoal({
      userId,
      weekStartDate,
      title,
      dueDay,
    });

    await goal.save();

    res.status(201).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

export const updateGoal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;

    const goal = await WeeklyGoal.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!goal) {
      throw new NotFoundError('Weekly goal not found');
    }

    res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGoal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;

    const goal = await WeeklyGoal.findOneAndDelete({ _id: id, userId });

    if (!goal) {
      throw new NotFoundError('Weekly goal not found');
    }

    res.status(200).json({
      success: true,
      message: 'Weekly goal deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
