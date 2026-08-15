import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/ai.service';
import { WorkoutSession } from '../models/WorkoutSession';
import { WorkoutSplit } from '../models/WorkoutSplit';
import { WorkoutCoachThread } from '../models/WorkoutCoachThread';
import { resolveExercise } from '../utils/resolveExercise';
import { BadRequestError, NotFoundError } from '../utils/custom-errors';

const weekdaysOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

function getWeekdayName(dateStr: string): typeof weekdaysOrder[number] {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return weekdaysOrder[date.getDay()];
}

// Helper to summarize a workout session for prompt inclusion
function summarizeSession(session: any): string {
  if (!session || !session.exercises || session.exercises.length === 0) {
    return 'No exercises logged.';
  }
  return session.exercises
    .map((ex: any) => {
      const name = ex.exerciseId?.name || 'Unknown Exercise';
      const setsStr = ex.sets
        .map((s: any) => `${s.reps} reps @ ${s.weightKg}kg (${s.completed ? 'completed' : 'failed'})`)
        .join(', ');
      return `- ${name}: ${setsStr}`;
    })
    .join('\n');
}

// 1. POST /ai/workout-split (Base split generation)
export const generateWorkoutSplit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { daysPerWeek, goal, experienceLevel } = req.body;
    const weekMap = await AIService.generateWorkoutSplit({ daysPerWeek, goal, experienceLevel });

    res.status(200).json({
      success: true,
      data: { weekMap },
    });
  } catch (error) {
    next(error);
  }
};

// 2. POST /ai/workout-session (Generate workout session with progressive overload & pain substitutions)
export const generateWorkoutSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { date, muscleGroup, equipment, fitnessLevel, painFlags } = req.body;

    // Autopilot: Fetch previous session context for progressive overload
    const lastSession = await WorkoutSession.findOne({ userId, muscleGroup })
      .sort({ date: -1 })
      .populate('exercises.exerciseId');

    const prevSessionSummary = lastSession ? summarizeSession(lastSession) : undefined;

    // Call Gemini API
    const aiSession = await AIService.generateWorkoutSession({
      date,
      muscleGroup,
      equipment,
      fitnessLevel,
      prevSessionSummary,
      painFlags,
    });

    // Resolve AI exerciseName to Mongo Exercise IDs
    const exercises = [];
    if (aiSession.exercises && aiSession.exercises.length > 0) {
      for (const ex of aiSession.exercises) {
        const exerciseId = await resolveExercise(ex.exerciseName, muscleGroup);
        exercises.push({
          exerciseId,
          sets: ex.sets,
          notes: ex.notes || '',
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        date,
        muscleGroup: aiSession.muscleGroup,
        durationMinutes: aiSession.durationMinutes || 45,
        exercises,
        painFlags: painFlags || [],
        completed: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. GET /ai/workout-insights (Workout insights)
export const getWorkoutInsights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    
    // Fetch last 15 sessions in past 4 weeks
    const d = new Date();
    d.setDate(d.getDate() - 28);
    const startDate = d.toISOString().split('T')[0];
    const sessions = await WorkoutSession.find({ userId, date: { $gte: startDate } })
      .sort({ date: -1 })
      .populate('exercises.exerciseId');

    if (sessions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          summary: 'Log at least one workout session to generate intelligent coaching insights.',
          recommendations: [],
        },
      });
    }

    // Summarize history for LLM
    const historySummary = sessions
      .map(s => `Date: ${s.date}, Muscle Group: ${s.muscleGroup}, Completion Rate: ${s.completionRate}%\n${summarizeSession(s)}`)
      .join('\n\n');

    const insights = await AIService.generateWorkoutInsights(historySummary);

    res.status(200).json({
      success: true,
      data: insights,
    });
  } catch (error) {
    next(error);
  }
};

// 4. POST /ai/parse-workout-log (NLP natural language log parser)
export const parseWorkoutLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rawText, date } = req.body;
    const aiSession = await AIService.parseWorkoutLog({ rawText, date });

    const exercises = [];
    if (aiSession.exercises && aiSession.exercises.length > 0) {
      for (const ex of aiSession.exercises) {
        const exerciseId = await resolveExercise(ex.exerciseName, aiSession.muscleGroup);
        exercises.push({
          exerciseId,
          sets: ex.sets,
          notes: ex.notes || '',
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        date,
        muscleGroup: aiSession.muscleGroup,
        durationMinutes: aiSession.durationMinutes || 45,
        exercises,
        completed: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 5. GET /ai/workout-plateau-check (Plateau & Deload Detection)
export const checkWorkoutPlateau = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const d = new Date();
    d.setDate(d.getDate() - 42); // last 6 weeks
    const startDate = d.toISOString().split('T')[0];
    
    const sessions = await WorkoutSession.find({ userId, date: { $gte: startDate } })
      .sort({ date: 1 })
      .populate('exercises.exerciseId');

    if (sessions.length < 3) {
      return res.status(200).json({
        success: true,
        data: {
          plateauDetected: false,
          affectedExercises: [],
          message: 'Not enough workout sessions in recent history to run plateau analysis (needs at least 3).',
        },
      });
    }

    // Step 1: Numeric trend detection in code (flat/declining max weight in 3+ consecutive sessions)
    const exerciseHistory: Record<string, { date: string; maxWeight: number }[]> = {};

    for (const session of sessions) {
      for (const ex of session.exercises) {
        const exerciseName = (ex.exerciseId as any)?.name;
        if (!exerciseName) continue;

        // Get max completed weightKg for this exercise in this session
        const completedSets = ex.sets.filter(s => s.completed);
        if (completedSets.length === 0) continue;

        const maxWeight = Math.max(...completedSets.map(s => s.weightKg));
        if (!exerciseHistory[exerciseName]) {
          exerciseHistory[exerciseName] = [];
        }
        exerciseHistory[exerciseName].push({ date: session.date, maxWeight });
      }
    }

    const affectedExercises: string[] = [];

    for (const [name, history] of Object.entries(exerciseHistory)) {
      if (history.length < 3) continue;

      // Sort by date (already sorted due to query sort, but let's be double sure)
      history.sort((a, b) => a.date.localeCompare(b.date));

      // We look at the most recent 3 sessions for this exercise
      const recent = history.slice(-3);
      
      // Check if maxWeight is flat or declining: recent[2] <= recent[1] <= recent[0]
      if (recent[2].maxWeight <= recent[1].maxWeight && recent[1].maxWeight <= recent[0].maxWeight) {
        affectedExercises.push(name);
      }
    }

    if (affectedExercises.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          plateauDetected: false,
          affectedExercises: [],
        },
      });
    }

    // Step 2: Query Gemini to build Deload week structure if plateau detected
    // Fetch user's active/recent session context for these exercises to deload
    const lastSessionsSummary = sessions
      .slice(-3)
      .map(s => `Date: ${s.date}, Muscle Group: ${s.muscleGroup}\n${summarizeSession(s)}`)
      .join('\n\n');

    const deloadSession = await AIService.generateDeloadWeek({
      affectedExercises,
      muscleGroup: sessions[sessions.length - 1].muscleGroup,
      prevSessionSummary: lastSessionsSummary,
    });

    const exercises = [];
    if (deloadSession.exercises && deloadSession.exercises.length > 0) {
      for (const ex of deloadSession.exercises) {
        const exerciseId = await resolveExercise(ex.exerciseName, deloadSession.muscleGroup);
        exercises.push({
          exerciseId,
          sets: ex.sets,
          notes: ex.notes || '',
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        plateauDetected: true,
        affectedExercises,
        recommendation: `Plateau detected on ${affectedExercises.join(', ')}. Suggested a deload week with 30-50% reduced volume for recovery.`,
        suggestedDeloadWeek: {
          muscleGroup: deloadSession.muscleGroup,
          durationMinutes: deloadSession.durationMinutes || 30,
          exercises,
          completed: false,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// 6. POST /ai/detect-equipment (Vision equipment detection)
export const detectEquipment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { image } = req.body;
    if (!image) {
      throw new BadRequestError('Image payload is required');
    }

    // Strip metadata base64 prefix
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    // Validate size limit (5MB)
    const sizeInBytes = (base64Data.length * 3) / 4;
    if (sizeInBytes > 5 * 1024 * 1024) {
      throw new BadRequestError('Image size exceeds 5MB limit');
    }

    const detectedEquipment = await AIService.detectEquipment(base64Data);

    res.status(200).json({
      success: true,
      data: { detectedEquipment },
    });
  } catch (error) {
    next(error);
  }
};

// 7. POST /ai/coach-chat (Fitness Coach Chat)
export const coachChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const { threadId, message } = req.body;

    let thread;
    if (threadId) {
      thread = await WorkoutCoachThread.findOne({ _id: threadId, userId });
      if (!thread) {
        throw new NotFoundError('Coach thread not found');
      }
    } else {
      thread = new WorkoutCoachThread({ userId, messages: [] });
    }

    // Format last 19 messages (cap thread context)
    const formattedHistory = thread.messages.slice(-19).map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Trigger Gemini coach chat
    const reply = await AIService.coachChat(formattedHistory, message);

    // Save user message and assistant reply to DB
    thread.messages.push({ role: 'user', content: message, createdAt: new Date() });
    thread.messages.push({ role: 'assistant', content: reply, createdAt: new Date() });

    // Enforce cap of 20 messages per thread
    thread.messages = thread.messages.slice(-20);
    thread.updatedAt = new Date();
    await thread.save();

    res.status(200).json({
      success: true,
      data: {
        threadId: thread._id,
        reply,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 8. POST /ai/regenerate-split (Adaptive split regeneration)
export const regenerateSplit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    
    // Fetch active split
    const oldSplit = await WorkoutSplit.findOne({ userId, active: true });
    if (!oldSplit) {
      throw new NotFoundError('No active workout split found for regeneration.');
    }

    // Pull sessions in last 21 days (3 weeks)
    const d = new Date();
    d.setDate(d.getDate() - 21);
    const startDate = d.toISOString().split('T')[0];
    const sessions = await WorkoutSession.find({ userId, date: { $gte: startDate } });

    // Group completion rates by weekday
    const weekdayCompletionSums: Record<string, number> = {};
    const weekdayCompletionCounts: Record<string, number> = {};

    for (const session of sessions) {
      const weekday = getWeekdayName(session.date);
      if (!weekdayCompletionSums[weekday]) {
        weekdayCompletionSums[weekday] = 0;
        weekdayCompletionCounts[weekday] = 0;
      }
      weekdayCompletionSums[weekday] += session.completionRate || 0;
      weekdayCompletionCounts[weekday] += 1;
    }

    // Identify low-compliance days (< 40%)
    const lowComplianceDays: string[] = [];
    const lowComplianceDetails: string[] = [];

    for (const [day, targetFocus] of Object.entries(oldSplit.weekMap)) {
      if (targetFocus === 'rest') continue;

      const sum = weekdayCompletionSums[day] || 0;
      const count = weekdayCompletionCounts[day] || 0;
      
      // If they didn't log any sessions on a training day, compliance is 0%
      const avgRate = count > 0 ? sum / count : 0;

      if (avgRate < 40) {
        lowComplianceDays.push(day);
        lowComplianceDetails.push(`${day.toUpperCase()} (${targetFocus}) had average compliance rate of ${Math.round(avgRate)}%`);
      }
    }

    if (lowComplianceDays.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          splitRegenerated: false,
          message: 'All scheduled workout days have healthy compliance rates (above 40%). Split regeneration not needed.',
        },
      });
    }

    const lowDaysSummary = lowComplianceDetails.join('\n');

    // Call Gemini to adjust split weekMap
    const regenerationResult = await AIService.regenerateSplit(oldSplit.weekMap, lowDaysSummary);

    // Deactivate old split
    oldSplit.active = false;
    await oldSplit.save();

    // Create new split
    const reasonText = `Compliance regeneration due to low rates on: ${lowComplianceDays.join(', ')}. ${regenerationResult.explanation}`;
    
    const newSplit = new WorkoutSplit({
      userId,
      weekMap: regenerationResult.weekMap,
      active: true,
      generatedByAi: true,
      regenerationHistory: [
        ...oldSplit.regenerationHistory.map(h => ({ date: h.date, reason: h.reason })),
        { date: new Date(), reason: reasonText },
      ],
    });

    await newSplit.save();

    res.status(200).json({
      success: true,
      data: {
        splitRegenerated: true,
        oldWeekMap: oldSplit.weekMap,
        newWeekMap: newSplit.weekMap,
        explanation: regenerationResult.explanation,
      },
    });
  } catch (error) {
    next(error);
  }
};
