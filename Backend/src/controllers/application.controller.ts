import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Application } from '../models/Application';
import { NotFoundError } from '../utils/custom-errors';
import { invalidateDashboardCache } from '../utils/cache';

const parseDateStr = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const formatDateStr = (d: Date): string => {
  return d.toISOString().split('T')[0];
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

const getPreviousWeekStartAndEnd = (dateStr: string): { start: string; end: string } => {
  const { start } = getWeekStartAndEnd(dateStr);
  const monday = parseDateStr(start);
  monday.setUTCDate(monday.getUTCDate() - 7);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return {
    start: formatDateStr(monday),
    end: formatDateStr(sunday),
  };
};

export const getApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { date, startDate, endDate, page, limit } = req.query;

    const filter: any = { userId };

    if (date) {
      filter.dateApplied = date;
    } else if (startDate && endDate) {
      filter.dateApplied = { $gte: startDate, $lte: endDate };
    }

    const query = Application.find(filter).sort({ dateApplied: -1, createdAt: -1 }).lean();

    if (page !== undefined || limit !== undefined) {
      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
      const skip = (pageNum - 1) * limitNum;

      const [applications, total] = await Promise.all([
        query.skip(skip).limit(limitNum),
        Application.countDocuments(filter),
      ]);

      return res.status(200).json({
        success: true,
        data: applications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }

    const applications = await query;

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

export const createApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { company, role, dateApplied, status, link, notes, aiCoverLetter, aiResumeBullets } = req.body;

    const application = new Application({
      userId,
      company,
      role,
      dateApplied,
      status,
      link,
      notes,
      aiCoverLetter,
      aiResumeBullets,
    });

    await application.save();
    invalidateDashboardCache(userId);

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;

    const application = await Application.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!application) {
      throw new NotFoundError('Job application not found');
    }

    invalidateDashboardCache(userId);

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;

    const application = await Application.findOneAndDelete({ _id: id, userId });

    if (!application) {
      throw new NotFoundError('Job application not found');
    }

    invalidateDashboardCache(userId);

    res.status(200).json({
      success: true,
      message: 'Job application deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const todayStr = (req.query.today as string) || new Date().toISOString().split('T')[0];

    const { start: currentWeekStart, end: currentWeekEnd } = getWeekStartAndEnd(todayStr);
    const { start: prevWeekStart, end: prevWeekEnd } = getPreviousWeekStartAndEnd(todayStr);

    // Single unified $facet aggregation pipeline for all 4 stats
    const facetResults = await Application.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $facet: {
          todayCount: [
            { $match: { dateApplied: todayStr } },
            { $count: 'count' },
          ],
          currentWeekCount: [
            { $match: { dateApplied: { $gte: currentWeekStart, $lte: currentWeekEnd } } },
            { $count: 'count' },
          ],
          prevWeekCount: [
            { $match: { dateApplied: { $gte: prevWeekStart, $lte: prevWeekEnd } } },
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
    ]);

    const facetData = facetResults[0] || {};
    const dailyCount = facetData.todayCount?.[0]?.count || 0;
    const currentWeekCount = facetData.currentWeekCount?.[0]?.count || 0;
    const prevWeekCount = facetData.prevWeekCount?.[0]?.count || 0;

    // Format status counts nicely
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

    res.status(200).json({
      success: true,
      data: {
        todayCount: dailyCount,
        todayTarget: 20,
        weeklyCount: currentWeekCount,
        prevWeekCount,
        weeklyDelta: currentWeekCount - prevWeekCount,
        statusDistribution: statusMap,
      },
    });
  } catch (error) {
    next(error);
  }
};
