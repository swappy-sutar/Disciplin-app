import { Types } from 'mongoose';
import { Quote } from '../models/Quote';
import { Habit } from '../models/Habit';

const DEFAULT_QUOTES = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
  { text: 'Either you run the day or the day runs you.', author: 'Jim Rohn' },
  { text: "It always seems impossible until it's done.", author: 'Nelson Mandela' },
  { text: "Opportunities don't happen, you create them.", author: 'Chris Grosser' },
  { text: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
  { text: 'You do not rise to the level of your goals. You fall to the level of your systems.', author: 'James Clear' },
  { text: 'Productivity is being able to do things that you were never able to do before.', author: 'Franz Kafka' },
  { text: "Don't count the days, make the days count.", author: 'Muhammad Ali' },
  { text: 'Small daily improvements over time lead to stunning results.', author: 'Robin Sharma' },
];

const DEFAULT_HABITS = [
  { name: 'Workout', color: '#10B981', order: 1 },
  { name: 'Study', color: '#3B82F6', order: 2 },
  { name: 'DSA', color: '#8B5CF6', order: 3 },
  { name: 'Interview Prep', color: '#F59E0B', order: 4 },
  { name: 'Project Work', color: '#EC4899', order: 5 },
  { name: 'Help Mom', color: '#EF4444', order: 6 },
  { name: 'Sleep (7-8 hrs)', color: '#6366F1', order: 7 },
];

/**
 * Seed global quotes on system startup if empty
 */
export const seedGlobalQuotes = async (): Promise<void> => {
  try {
    const count = await Quote.countDocuments({ isCustom: false });
    if (count === 0) {
      await Quote.insertMany(
        DEFAULT_QUOTES.map((q) => ({
          ...q,
          isFavorite: false,
          isCustom: false,
        }))
      );
      console.log('🌱 Seeded default global quotes successfully');
    }
  } catch (error) {
    console.error('❌ Error seeding global quotes:', error);
  }
};

/**
 * Seed default habits for a specific user upon registration
 */
export const seedUserHabits = async (userId: Types.ObjectId | string): Promise<void> => {
  try {
    const count = await Habit.countDocuments({ userId });
    if (count === 0) {
      const habitsToInsert = DEFAULT_HABITS.map((h) => ({
        userId,
        name: h.name,
        color: h.color,
        order: h.order,
        isActive: true,
      }));
      await Habit.insertMany(habitsToInsert);
      console.log(`🌱 Seeded default habits for user ${userId}`);
    }
  } catch (error) {
    console.error(`❌ Error seeding habits for user ${userId}:`, error);
  }
};
