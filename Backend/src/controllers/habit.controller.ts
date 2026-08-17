import { Request, Response, NextFunction } from 'express';
import { Habit } from '../models/Habit';
import { HabitLog } from '../models/HabitLog';
import * as habitService from '../services/habit.service';
import { NotFoundError } from '../utils/custom-errors';
import { invalidateDashboardCache, invalidateHabitsCache } from '../utils/cache';

export const getHabits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const todayStr = (req.query.today as string) || new Date().toISOString().split('T')[0];

    const habitsWithStreaks = await habitService.calculateStreaks(userId, todayStr);

    res.status(200).json({
      success: true,
      data: habitsWithStreaks,
    });
  } catch (error) {
    next(error);
  }
};

export const createHabit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { name, color, order } = req.body;

    const habit = new Habit({
      userId,
      name,
      color,
      order,
    });

    await habit.save();
    invalidateDashboardCache(userId);
    invalidateHabitsCache(userId);

    res.status(201).json({
      success: true,
      data: habit,
    });
  } catch (error) {
    next(error);
  }
};

export const updateHabit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;

    const habit = await Habit.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!habit) {
      throw new NotFoundError('Habit not found');
    }

    invalidateDashboardCache(userId);
    invalidateHabitsCache(userId);

    res.status(200).json({
      success: true,
      data: habit,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHabit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;

    const habit = await Habit.findOneAndDelete({ _id: id, userId });

    if (!habit) {
      throw new NotFoundError('Habit not found');
    }

    // Cascade delete all logs associated with this habit
    await HabitLog.deleteMany({ userId, habitId: id });

    invalidateDashboardCache(userId);
    invalidateHabitsCache(userId);

    res.status(200).json({
      success: true,
      message: 'Habit and its logs deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };

    const logs = await HabitLog.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).lean();

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { habitId, date, isDone } = req.body;

    // Check if habit exists and belongs to user
    const habit = await Habit.findOne({ _id: habitId, userId }).select('_id').lean();
    if (!habit) {
      throw new NotFoundError('Habit not found');
    }

    const log = await HabitLog.findOneAndUpdate(
      { userId, habitId, date },
      { $set: { isDone } },
      { upsert: true, new: true, runValidators: true }
    );

    invalidateDashboardCache(userId);
    invalidateHabitsCache(userId);

    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};
