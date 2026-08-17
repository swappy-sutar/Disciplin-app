import { Request, Response, NextFunction } from 'express';
import { Exercise } from '../models/Exercise';
import { WorkoutSplit } from '../models/WorkoutSplit';
import { WorkoutSession } from '../models/WorkoutSession';
import { NotFoundError, BadRequestError } from '../utils/custom-errors';
import { invalidateDashboardCache } from '../utils/cache';

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

    const exercises = await Exercise.find(filter).sort({ name: 1 }).lean();

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

    let split: any = await WorkoutSplit.findOne({ userId, active: true }).lean();
    if (!split) {
      const newSplit = new WorkoutSplit({
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
      await newSplit.save();
      split = newSplit.toObject();
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
      { userId, active: true },
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
    let session = await WorkoutSession.findOne({ userId, date: dateStr })
      .populate('exercises.exerciseId')
      .lean();

    if (session) {
      res.status(200).json({
        success: true,
        data: session
      });
      return;
    }

    // Resolve split for the date's weekday
    const weekday = getWeekdayName(dateStr);
    let split: any = await WorkoutSplit.findOne({ userId, active: true }).lean();
    if (!split) {
      const newSplit = new WorkoutSplit({
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
      await newSplit.save();
      split = newSplit.toObject();
    }

    const muscleGroup = (split as any).weekMap[weekday] || 'rest';

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
    const matchingExercises = await Exercise.find({ muscleGroup }).sort({ name: 1 }).lean();

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

    invalidateDashboardCache(userId);

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
    const { startDate, endDate, page, limit } = req.query as {
      startDate?: string;
      endDate?: string;
      page?: string;
      limit?: string;
    };

    const filter: any = { userId };
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const query = WorkoutSession.find(filter)
      .populate('exercises.exerciseId')
      .sort({ date: -1 })
      .lean();

    if (page !== undefined || limit !== undefined) {
      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
      const skip = (pageNum - 1) * limitNum;

      const [sessions, total] = await Promise.all([
        query.skip(skip).limit(limitNum),
        WorkoutSession.countDocuments(filter),
      ]);

      return res.status(200).json({
        success: true,
        data: sessions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }

    const sessions = await query;

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
    })
      .select('date')
      .lean();

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

// 8. Get YouTube video ID for an exercise
export const getExerciseVideo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.query;
    if (!name) {
      throw new BadRequestError('Exercise name is required');
    }

    const query = `${name} exercise form guidance tutorial`;
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await response.text();
    
    // Match the first YouTube video ID
    const regex = /\/watch\?v=([a-zA-Z0-9_-]{11})/;
    const match = html.match(regex);
    const videoId = match ? match[1] : null;

    res.status(200).json({
      success: true,
      data: { videoId }
    });
  } catch (error) {
    next(error);
  }
};

