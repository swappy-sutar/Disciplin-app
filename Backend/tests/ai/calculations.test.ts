import { describe, it, expect } from 'vitest';
import { calculateStreaks } from '../../src/services/habit.service';
import { Habit } from '../../src/models/Habit';
import { HabitLog } from '../../src/models/HabitLog';
import { createTestUser } from '../helpers/authHelper';

describe('Pure Calculation Unit Tests', () => {
  describe('Habit Streak Calculations (calculateStreaks)', () => {
    it('should correctly calculate 0 streak for a new habit with no logs', async () => {
      const { user } = await createTestUser();
      const habit = await Habit.create({
        userId: user._id,
        name: 'New Habit',
      });

      const res = await calculateStreaks(user._id, '2026-08-17');
      expect(res.length).toBe(1);
      expect(res[0].currentStreak).toBe(0);
    });

    it('should count continuous streak up to today', async () => {
      const { user } = await createTestUser();
      const habit = await Habit.create({
        userId: user._id,
        name: 'Continuous Habit',
      });

      // Log for today and previous 3 days (4 days total)
      const dates = ['2026-08-17', '2026-08-16', '2026-08-15', '2026-08-14'];
      for (const d of dates) {
        await HabitLog.create({
          userId: user._id,
          habitId: habit._id,
          date: d,
          isDone: true,
        });
      }

      const res = await calculateStreaks(user._id, '2026-08-17');
      expect(res[0].currentStreak).toBe(4);
    });

    it('should preserve streak if completed yesterday but not yet today', async () => {
      const { user } = await createTestUser();
      const habit = await Habit.create({
        userId: user._id,
        name: 'Yesterday Habit',
      });

      const dates = ['2026-08-16', '2026-08-15', '2026-08-14'];
      for (const d of dates) {
        await HabitLog.create({
          userId: user._id,
          habitId: habit._id,
          date: d,
          isDone: true,
        });
      }

      const res = await calculateStreaks(user._id, '2026-08-17');
      expect(res[0].currentStreak).toBe(3);
    });

    it('should reset streak to 0 if a gap of 2 or more days occurs', async () => {
      const { user } = await createTestUser();
      const habit = await Habit.create({
        userId: user._id,
        name: 'Broken Habit',
      });

      // Log completed 3 days ago, missing yesterday and today
      await HabitLog.create({
        userId: user._id,
        habitId: habit._id,
        date: '2026-08-14',
        isDone: true,
      });

      const res = await calculateStreaks(user._id, '2026-08-17');
      expect(res[0].currentStreak).toBe(0);
    });
  });
});
