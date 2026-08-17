import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { TimetableBlock } from '../models/TimetableBlock';
import { WeeklyGoal } from '../models/WeeklyGoal';
import { Topic } from '../models/Topic';
import { Application } from '../models/Application';
import { Quote } from '../models/Quote';
import { HabitLog } from '../models/HabitLog';
import * as habitService from '../services/habit.service';
import { getOrCreateBlocks } from '../services/timetable.service';

import { getCache, setCache } from '../utils/cache';

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

    const cacheKey = `dashboard_${userId}_${dateStr}`;
    const cachedResponse = getCache<any>(cacheKey);
    if (cachedResponse) {
      return res.status(200).json(cachedResponse);
    }

    const yesterdayStr = getYesterdayDateStr(dateStr);
    const { start: weekStart, end: weekEnd } = getWeekStartAndEnd(dateStr);

    // 1. Timetable Blocks for Today
    const todayBlocksPromise = getOrCreateBlocks(userId, dateStr);

    // 2. Concurrently execute all independent dashboard queries
    const [
      todayBlocks,
      yesterdayBlocks,
      habitsWithStreaks,
      weekLogs,
      weeklyGoals,
      pendingTopics,
      appFacetResults,
      quotes,
    ] = await Promise.all([
      todayBlocksPromise,
      TimetableBlock.find({ userId, date: yesterdayStr }).select('isDone').lean(),
      habitService.calculateStreaks(userId, dateStr),
      HabitLog.find({
        userId,
        date: { $gte: weekStart, $lte: weekEnd },
      })
        .select('habitId date isDone')
        .lean(),
      WeeklyGoal.find({ userId, weekStartDate: weekStart }).lean(),
      Topic.find({
        userId,
        progressPercent: { $lt: 100 },
      })
        .select('title category progressPercent subTopics')
        .sort({ progressPercent: -1, createdAt: -1 })
        .limit(3)
        .lean(),
      Application.aggregate([
        { $match: { userId: new Types.ObjectId(userId) } },
        {
          $facet: {
            todayCount: [
              { $match: { dateApplied: dateStr } },
              { $count: 'count' },
            ],
            weeklyCount: [
              { $match: { dateApplied: { $gte: weekStart, $lte: weekEnd } } },
              { $count: 'count' },
            ],
            statusDistribution: [
              {
                $group: {
                  _id: '$status',
                  count: { $sum: 1 },
                },
              },
            ],
          },
        },
      ]),
      Quote.find({
        $or: [{ isCustom: false }, { isCustom: true, userId }],
      })
        .select('text author isFavorite isCustom')
        .lean(),
    ]);

    // Calculate Day Progress
    const completedBlocksCount = todayBlocks.filter((b) => b.isDone).length;
    const totalBlocksCount = todayBlocks.length;
    const todayProgress = totalBlocksCount > 0 ? Math.round((completedBlocksCount / totalBlocksCount) * 100) : 0;

    const completedYesterdayCount = yesterdayBlocks.filter((b) => b.isDone).length;
    const totalYesterdayCount = yesterdayBlocks.length;
    const yesterdayProgress =
      totalYesterdayCount > 0 ? Math.round((completedYesterdayCount / totalYesterdayCount) * 100) : 0;

    const progressDelta = todayProgress - yesterdayProgress;

    // Process Application Facet Results
    const facetData = appFacetResults[0] || {};
    const appDailyCount = facetData.todayCount?.[0]?.count || 0;
    const appWeeklyCount = facetData.weeklyCount?.[0]?.count || 0;

    const statusMap: Record<string, number> = {
      Applied: 0,
      OA: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
    };
    (facetData.statusDistribution || []).forEach((item: any) => {
      if (item._id in statusMap) {
        statusMap[item._id] = item.count;
      }
    });

    // Today's Quote Selection
    let quote: any = {
      text: 'Make today your masterpiece.',
      author: 'John Wooden',
      isFavorite: false,
      isCustom: false,
    };
    if (quotes.length > 0) {
      const idx = getHashIndex(dateStr, quotes.length);
      const todayQ = quotes[idx];
      quote = {
        _id: todayQ._id,
        text: todayQ.text,
        author: todayQ.author,
        isFavorite: todayQ.isFavorite,
        isCustom: todayQ.isCustom,
      };
    }

    const payload = {
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
    };

    // Cache dashboard result for 60s
    setCache(cacheKey, payload, 60);

    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};
