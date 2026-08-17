import { Request, Response, NextFunction } from 'express';
import { FitnessGoal } from '../models/FitnessGoal.model';
import { BodyMetric } from '../models/BodyMetric.model';

// 1. POST /fitness-goals — Create a new goal (deactivate existing active goal)
export const createFitnessGoal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { goalType, startingWeightKg, targetWeightKg, heightCm, activityLevel, targetDate } = req.body;

    // Deactivate existing active goals for this user
    await FitnessGoal.updateMany({ userId, isActive: true }, { isActive: false });

    const goal = await FitnessGoal.create({
      userId,
      goalType,
      startingWeightKg,
      targetWeightKg,
      heightCm,
      activityLevel,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET /fitness-goals/active — Fetch current active goal
export const getActiveFitnessGoal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const goal = await FitnessGoal.findOne({ userId, isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: goal || null,
    });
  } catch (error) {
    next(error);
  }
};

// 3. POST /body-metrics — Log or upsert weight/body fat for a date
export const logBodyMetric = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { date, weightKg, bodyFatPercent } = req.body;

    const metric = await BodyMetric.findOneAndUpdate(
      { userId, date },
      {
        userId,
        date,
        weightKg,
        ...(bodyFatPercent !== undefined ? { bodyFatPercent } : {}),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    res.status(200).json({
      success: true,
      data: metric,
    });
  } catch (error) {
    next(error);
  }
};

// 4. GET /body-metrics — Fetch historical body metrics
export const getBodyMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 90;
    const { page, limit } = req.query;

    const lookbackDate = new Date();
    lookbackDate.setDate(lookbackDate.getDate() - days);
    const startDateStr = lookbackDate.toISOString().split('T')[0];

    const filter = {
      userId,
      date: { $gte: startDateStr },
    };

    const query = BodyMetric.find(filter).sort({ date: 1 }).lean();

    if (page !== undefined || limit !== undefined) {
      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 30));
      const skip = (pageNum - 1) * limitNum;

      const [metrics, total] = await Promise.all([
        query.skip(skip).limit(limitNum),
        BodyMetric.countDocuments(filter),
      ]);

      return res.status(200).json({
        success: true,
        data: metrics,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }

    const metrics = await query;

    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};
