import { Types } from 'mongoose';
import { Habit } from '../models/Habit';
import { HabitLog } from '../models/HabitLog';

const getPreviousDateString = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().split('T')[0];
};

export const calculateStreaks = async (userId: string | Types.ObjectId, todayStr: string) => {
  const habits = await Habit.find({ userId, isActive: true }).sort({ order: 1 });
  const logs = await HabitLog.find({ userId, isDone: true });

  const logsMap = new Map<string, Set<string>>();
  for (const log of logs) {
    const hId = log.habitId.toString();
    if (!logsMap.has(hId)) {
      logsMap.set(hId, new Set<string>());
    }
    logsMap.get(hId)!.add(log.date);
  }

  return habits.map((habit) => {
    const hId = habit._id.toString();
    const dates = logsMap.get(hId) || new Set<string>();

    let streak = 0;
    let currentCheck = todayStr;

    const completedToday = dates.has(todayStr);
    const yesterdayStr = getPreviousDateString(todayStr);
    const completedYesterday = dates.has(yesterdayStr);

    if (completedToday) {
      streak = 1;
      currentCheck = yesterdayStr;
      while (dates.has(currentCheck)) {
        streak++;
        currentCheck = getPreviousDateString(currentCheck);
      }
    } else if (completedYesterday) {
      streak = 1;
      currentCheck = getPreviousDateString(yesterdayStr);
      while (dates.has(currentCheck)) {
        streak++;
        currentCheck = getPreviousDateString(currentCheck);
      }
    }

    return {
      _id: habit._id,
      name: habit.name,
      color: habit.color,
      isActive: habit.isActive,
      order: habit.order,
      currentStreak: streak,
      longestStreak: streak,
    };
  });
};
