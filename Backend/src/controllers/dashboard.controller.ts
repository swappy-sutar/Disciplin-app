import { Request, Response, NextFunction } from 'express';
import { TimetableBlock } from '../models/TimetableBlock';
import { WeeklyGoal } from '../models/WeeklyGoal';
import { Topic } from '../models/Topic';
import { Application } from '../models/Application';
import { Quote } from '../models/Quote';
import { HabitLog } from '../models/HabitLog';
import * as habitService from '../services/habit.service';
import { getOrCreateBlocks } from '../services/timetable.service';

const parseDateStr = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const formatDateStr = (d: Date): string => {
  return d.toISOString().split('T')[0];
};

const getYesterdayDateStr = (dateStr: string): string => {
  const d = parseDateStr(dateStr);
  d.setUTCDate(d.getUTCDate() - 1);
  return formatDateStr(d);
};

const getWeekStartAndEnd = (dateStr: string): { start: string; end: string } => {
  const d = parseDateStr(dateStr);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return {
    start: formatDateStr(monday),
    end: formatDateStr(sunday),
  };
};

const getHashIndex = (str: string, max: number): number => {
  if (max <= 0) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % max;
};

export const getSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];

    const yesterdayStr = getYesterdayDateStr(dateStr);
    const { start: weekStart, end: weekEnd } = getWeekStartAndEnd(dateStr);

    // 1. Timetable Blocks for Today (Pre-populate template automatically if unvisited)
    const todayBlocks = await getOrCreateBlocks(userId, dateStr);

    // 2. Day Progress Calculation (Today and Yesterday)
    const completedBlocksCount = todayBlocks.filter((b) => b.isDone).length;
    const totalBlocksCount = todayBlocks.length;
    const todayProgress = totalBlocksCount > 0 ? Math.round((completedBlocksCount / totalBlocksCount) * 100) : 0;

    const yesterdayBlocks = await TimetableBlock.find({ userId, date: yesterdayStr });
    const completedYesterdayCount = yesterdayBlocks.filter((b) => b.isDone).length;
    const totalYesterdayCount = yesterdayBlocks.length;
    const yesterdayProgress =
      totalYesterdayCount > 0 ? Math.round((completedYesterdayCount / totalYesterdayCount) * 100) : 0;

    const progressDelta = todayProgress - yesterdayProgress;

    // 3. Habits with Streaks & Logs for Current Week
    const habitsWithStreaks = await habitService.calculateStreaks(userId, dateStr);
    const weekLogs = await HabitLog.find({
      userId,
      date: { $gte: weekStart, $lte: weekEnd },
    });

    // 4. Weekly Goals
    const weeklyGoals = await WeeklyGoal.find({ userId, weekStartDate: weekStart });

    // 5. Topics - Top 3 pending progress
    const pendingTopics = await Topic.find({
      userId,
      progressPercent: { $lt: 100 },
    })
      .sort({ progressPercent: -1, createdAt: -1 })
      .limit(3);

    // 6. Job Application Tracker Stats
    const appDailyCount = await Application.countDocuments({ userId, dateApplied: dateStr });
    const appWeeklyCount = await Application.countDocuments({
      userId,
      dateApplied: { $gte: weekStart, $lte: weekEnd },
    });

    const statusCounts = await Application.aggregate([
      { $match: { userId: parseDateStr(dateStr) ? new Object(userId) : userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusMap: Record<string, number> = {
      Applied: 0,
      OA: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
    };
    statusCounts.forEach((item) => {
      if (item._id in statusMap) {
        statusMap[item._id] = item.count;
      }
    });

    // 7. Today's Quote
    const quotes = await Quote.find({
      $or: [{ isCustom: false }, { isCustom: true, userId }],
    });
    let quote = {
      text: 'Make today your masterpiece.',
      author: 'John Wooden',
      isFavorite: false,
      isCustom: false,
    };
    if (quotes.length > 0) {
      const idx = getHashIndex(dateStr, quotes.length);
      const todayQ = quotes[idx];
      quote = {
        text: todayQ.text,
        author: todayQ.author,
        isFavorite: todayQ.isFavorite,
        isCustom: todayQ.isCustom,
      };
    }

    res.status(200).json({
      success: true,
      data: {
        timetable: todayBlocks,
        progress: {
          todayPercent: todayProgress,
          yesterdayPercent: yesterdayProgress,
          delta: progressDelta,
        },
        habits: {
          list: habitsWithStreaks,
          logs: weekLogs,
        },
        weeklyGoals,
        topics: pendingTopics,
        applications: {
          todayCount: appDailyCount,
          todayTarget: 20,
          weeklyCount: appWeeklyCount,
          statusDistribution: statusMap,
        },
        quote,
      },
    });
  } catch (error) {
    next(error);
  }
};
