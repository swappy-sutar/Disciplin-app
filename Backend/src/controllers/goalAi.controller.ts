import { Request, Response, NextFunction } from 'express';
import { FitnessGoal } from '../models/FitnessGoal.model';
import { BodyMetric } from '../models/BodyMetric.model';
import { WorkoutSplit } from '../models/WorkoutSplit';
import { AIService } from '../services/ai.service';
import { NotFoundError, BadRequestError } from '../utils/custom-errors';

// 1. POST /ai/goal-program
export const generateGoalProgram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { daysPerWeek, experienceLevel } = req.body;

    // Fetch active fitness goal
    const activeGoal = await FitnessGoal.findOne({ userId, isActive: true });
    if (!activeGoal) {
      throw new BadRequestError('Please create an active fitness goal first before generating a goal program.');
    }

    // Fetch recent 3 body metrics for weight trend context
    const recentMetrics = await BodyMetric.find({ userId })
      .sort({ date: -1 })
      .limit(3);

    let recentWeightTrend: string | undefined;
    if (recentMetrics.length >= 2) {
      const latest = recentMetrics[0].weightKg;
      const oldest = recentMetrics[recentMetrics.length - 1].weightKg;
      const diff = latest - oldest;
      recentWeightTrend = `Recent weight is ${latest} kg (${diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} kg over last ${recentMetrics.length} logs)`;
    } else if (recentMetrics.length === 1) {
      recentWeightTrend = `Latest recorded weight is ${recentMetrics[0].weightKg} kg`;
    }

    // Call Gemini via AIService
    const aiOutput = await AIService.generateGoalProgram({
      daysPerWeek,
      experienceLevel,
      goalType: activeGoal.goalType,
      startingWeightKg: activeGoal.startingWeightKg,
      targetWeightKg: activeGoal.targetWeightKg,
      activityLevel: activeGoal.activityLevel,
      heightCm: activeGoal.heightCm,
      recentWeightTrend,
    });

    // Deactivate previous active workout splits
    await WorkoutSplit.updateMany({ userId, active: true }, { active: false });

    // Create new active workout split with generatedByAi: true
    const workoutSplit = await WorkoutSplit.create({
      userId,
      weekMap: aiOutput.weekMap,
      active: true,
      generatedByAi: true,
      regenerationHistory: [
        {
          date: new Date(),
          reason: `Initial AI program generated for ${activeGoal.goalType} goal (${daysPerWeek} days/week, ${experienceLevel})`,
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: {
        workoutSplit,
        calorieDirection: aiOutput.calorieDirection,
        generalGuidance: aiOutput.generalGuidance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET /ai/goal-progress
export const checkGoalProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;

    // Fetch active fitness goal
    const activeGoal = await FitnessGoal.findOne({ userId, isActive: true });
    if (!activeGoal) {
      throw new NotFoundError('No active fitness goal found. Please set a goal first.');
    }

    // Fetch body metrics within the lookback window
    const lookbackDate = new Date();
    lookbackDate.setDate(lookbackDate.getDate() - days);
    const startDateStr = lookbackDate.toISOString().split('T')[0];

    const metrics = await BodyMetric.find({
      userId,
      date: { $gte: startDateStr },
    }).sort({ date: 1 }); // Chronological order

    // If fewer than 3 entries, skip Gemini and return friendly guidance message
    if (metrics.length < 3) {
      return res.status(200).json({
        success: true,
        data: {
          onTrack: null,
          summary: `You have logged ${metrics.length} ${metrics.length === 1 ? 'entry' : 'entries'} in the last ${days} days. Log at least 3 entries to unlock AI progress analysis and feedback.`,
          adjustmentSuggestion: 'Consistent weigh-ins (e.g. 2-3 times per week under similar morning conditions) ensure the highest trend accuracy.',
        },
      });
    }

    // Server-side mathematical trend calculations
    const firstMetric = metrics[0];
    const lastMetric = metrics[metrics.length - 1];
    const currentWeightKg = lastMetric.weightKg;
    const weightChangeKg = Number((lastMetric.weightKg - firstMetric.weightKg).toFixed(2));

    const firstDate = new Date(firstMetric.date);
    const lastDate = new Date(lastMetric.date);
    const diffMs = Math.max(1, lastDate.getTime() - firstDate.getTime());
    const daysElapsed = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    const weeksElapsed = Math.max(0.14, daysElapsed / 7);

    const ratePerWeekKg = Number((weightChangeKg / weeksElapsed).toFixed(2));

    // Determine if on track based on goalType and rate of change
    let onTrack = false;
    switch (activeGoal.goalType) {
      case 'weight_loss':
        // Losing weight at a healthy pace (-0.1 to -1.5 kg/week) or overall net loss toward target
        onTrack = (ratePerWeekKg < -0.05 && ratePerWeekKg >= -1.5) || (currentWeightKg < activeGoal.startingWeightKg && currentWeightKg <= activeGoal.targetWeightKg + 0.5);
        break;
      case 'weight_gain':
        // Gaining weight at a steady pace (+0.1 to +1.0 kg/week)
        onTrack = (ratePerWeekKg > 0.05 && ratePerWeekKg <= 1.0) || (currentWeightKg > activeGoal.startingWeightKg);
        break;
      case 'muscle_build':
        // Mild surplus or steady weight with resistance training
        onTrack = ratePerWeekKg >= -0.1 && ratePerWeekKg <= 0.6;
        break;
      case 'recomposition':
        // Weight relatively stable (between -0.3 and +0.3 kg/week)
        onTrack = Math.abs(ratePerWeekKg) <= 0.4;
        break;
      default:
        onTrack = true;
    }

    // Call Gemini to phrase the pre-computed findings naturally
    const aiFeedback = await AIService.phraseGoalProgress({
      goalType: activeGoal.goalType,
      startingWeightKg: activeGoal.startingWeightKg,
      targetWeightKg: activeGoal.targetWeightKg,
      currentWeightKg,
      weightChangeKg,
      ratePerWeekKg,
      onTrack,
      historyDays: daysElapsed,
      metricsCount: metrics.length,
    });

    res.status(200).json({
      success: true,
      data: {
        onTrack: aiFeedback.onTrack,
        summary: aiFeedback.summary,
        adjustmentSuggestion: aiFeedback.adjustmentSuggestion,
      },
    });
  } catch (error) {
    next(error);
  }
};
