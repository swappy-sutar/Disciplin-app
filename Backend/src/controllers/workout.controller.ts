import { Request, Response, NextFunction } from 'express';
import { Exercise } from '../models/Exercise';
import { WorkoutSplit } from '../models/WorkoutSplit';
import { WorkoutSession } from '../models/WorkoutSession';
import { NotFoundError, BadRequestError } from '../utils/custom-errors';

const getWeekdayName = (dateStr: string): 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekdays: Array<'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'> = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday'
  ];
  return weekdays[date.getDay()] as any;
};

const getPreviousDateString = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().split('T')[0];
};

// 1. Get Exercises library
export const getExercises = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { muscleGroup, equipment } = req.query;
    const filter: any = {};

    if (muscleGroup) {
      filter.muscleGroup = muscleGroup;
    }
    if (equipment) {
      filter.equipment = equipment;
    }

    const exercises = await Exercise.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: exercises
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get user split
export const getSplit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;

    let split = await WorkoutSplit.findOne({ userId });
    if (!split) {
      split = new WorkoutSplit({
        userId,
        weekMap: {
          monday: 'rest',
          tuesday: 'rest',
          wednesday: 'rest',
          thursday: 'rest',
          friday: 'rest',
          saturday: 'rest',
          sunday: 'rest'
        }
      });
      await split.save();
    }

    res.status(200).json({
      success: true,
      data: split
    });
  } catch (error) {
    next(error);
  }
};

// 3. Update user split
export const updateSplit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { weekMap } = req.body;

    const split = await WorkoutSplit.findOneAndUpdate(
      { userId },
      { $set: { weekMap, updatedAt: new Date() } },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: split
    });
  } catch (error) {
    next(error);
  }
};

// 4. Get today's session (auto-creates template if not logged)
export const getTodaySession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];

    // Find if user already has a logged session for this date
    let session = await WorkoutSession.findOne({ userId, date: dateStr }).populate('exercises.exerciseId');

    if (session) {
      res.status(200).json({
        success: true,
        data: session
      });
      return;
    }

    // Resolve split for the date's weekday
    const weekday = getWeekdayName(dateStr);
    let split = await WorkoutSplit.findOne({ userId });
    if (!split) {
      split = new WorkoutSplit({
        userId,
        weekMap: {
          monday: 'rest',
          tuesday: 'rest',
          wednesday: 'rest',
          thursday: 'rest',
          friday: 'rest',
          saturday: 'rest',
          sunday: 'rest'
        }
      });
      await split.save();
    }

    const muscleGroup = split.weekMap[weekday] || 'rest';

    // If rest day, return empty template
    if (muscleGroup === 'rest') {
      res.status(200).json({
        success: true,
        data: {
          date: dateStr,
          muscleGroup: 'rest',
          exercises: [],
          completed: false,
          durationMinutes: 0
        }
      });
      return;
    }

    // Find exercises matching the split's muscle group
    const matchingExercises = await Exercise.find({ muscleGroup }).sort({ name: 1 });

    const exercisesTemplate = matchingExercises.map((ex) => ({
      exerciseId: ex,
      sets: [
        { setNumber: 1, reps: 0, weightKg: 0, completed: false },
        { setNumber: 2, reps: 0, weightKg: 0, completed: false },
        { setNumber: 3, reps: 0, weightKg: 0, completed: false }
      ],
      notes: ''
    }));

    res.status(200).json({
      success: true,
      data: {
        date: dateStr,
        muscleGroup,
        exercises: exercisesTemplate,
        completed: false,
        durationMinutes: 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// 5. Save/update workout session
export const saveSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { date, muscleGroup, exercises, durationMinutes, completed } = req.body;

    const session = await WorkoutSession.findOneAndUpdate(
      { userId, date },
      {
        $set: {
          muscleGroup,
          exercises,
          durationMinutes,
          completed,
          createdAt: new Date()
        }
      },
      { upsert: true, new: true, runValidators: true }
    ).populate('exercises.exerciseId');

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// 6. Get sessions history list
export const getHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };

    const filter: any = { userId };
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const sessions = await WorkoutSession.find(filter)
      .populate('exercises.exerciseId')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

// 7. Calculate workout streak
export const getStreak = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const todayStr = (req.query.today as string) || new Date().toISOString().split('T')[0];

    const completedSessions = await WorkoutSession.find({
      userId,
      completed: true
    }).select('date');

    const completedDates = new Set(completedSessions.map((s) => s.date));

    let currentStreak = 0;
    let longestStreak = 0;

    // Calculate current streak
    const completedToday = completedDates.has(todayStr);
    const yesterdayStr = getPreviousDateString(todayStr);
    const completedYesterday = completedDates.has(yesterdayStr);

    let streakCounter = 0;
    let dateCheck = todayStr;

    if (completedToday) {
      streakCounter = 1;
      dateCheck = yesterdayStr;
      while (completedDates.has(dateCheck)) {
        streakCounter++;
        dateCheck = getPreviousDateString(dateCheck);
      }
    } else if (completedYesterday) {
      streakCounter = 1;
      dateCheck = getPreviousDateString(yesterdayStr);
      while (completedDates.has(dateCheck)) {
        streakCounter++;
        dateCheck = getPreviousDateString(dateCheck);
      }
    }
    currentStreak = streakCounter;

    // Calculate longest streak in history
    const sortedDates = Array.from(completedDates).sort();
    let maxStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const dStr of sortedDates) {
      const [year, month, day] = dStr.split('-').map(Number);
      const currDate = new Date(Date.UTC(year, month - 1, day));

      if (prevDate === null) {
        tempStreak = 1;
      } else {
        const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          if (tempStreak > maxStreak) {
            maxStreak = tempStreak;
          }
          tempStreak = 1;
        }
      }
      prevDate = currDate;
    }

    if (tempStreak > maxStreak) {
      maxStreak = tempStreak;
    }
    longestStreak = Math.max(currentStreak, maxStreak);

    res.status(200).json({
      success: true,
      data: {
        currentStreak,
        longestStreak
      }
    });
  } catch (error) {
    next(error);
  }
};
