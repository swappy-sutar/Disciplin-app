import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { seedGlobalQuotes } from './utils/seed-data';
import { User } from './models/User';
import { WeeklyGoal } from './models/WeeklyGoal';
import { TimetableBlock } from './models/TimetableBlock';
import { Topic } from './models/Topic';
import { Habit } from './models/Habit';
import { HabitLog } from './models/HabitLog';

const startServer = async () => {
  try {
    await connectDB();

    // Defensive: Mark all pre-existing users as verified so they don't get locked out
    await User.updateMany({ isVerified: { $exists: false } }, { $set: { isVerified: true } });

    // Database cleanup: Remove pre-seeded dummy data for all users
    const deleteDummyData = async () => {
      try {
        const dummyGoalTitles = [
          'Complete Portfolio UI',
          'Apply to 20 Jobs',
          'Finish 10 DSA Medium',
          'Practice System Design'
        ];
        const resGoals = await WeeklyGoal.deleteMany({
          title: { $in: dummyGoalTitles.map(t => new RegExp(t, 'i')) }
        });
        console.log(`🧹 Cleaned up ${resGoals.deletedCount} dummy weekly goals.`);

        const dummyTimetableLabels = [
          'Morning Routine',
          'System Architecture Review',
          'DSA Practice: Graphs',
          'Networking Call',
          'Project Deployment'
        ];
        const resTimetable = await TimetableBlock.deleteMany({
          label: { $in: dummyTimetableLabels.map(l => new RegExp(l, 'i')) }
        });
        console.log(`🧹 Cleaned up ${resTimetable.deletedCount} dummy timetable blocks.`);

        const dummyTopicTitles = [
          'Graph Algorithms & Theory',
          'System Design & Scale',
          'React & Frontend Architecture'
        ];
        const resTopics = await Topic.deleteMany({
          title: { $in: dummyTopicTitles.map(t => new RegExp(t, 'i')) }
        });
        console.log(`🧹 Cleaned up ${resTopics.deletedCount} dummy topics.`);

        // Find habits to delete
        const dummyHabitNames = [
          'Workout',
          'Study',
          'DSA',
          'Interview Prep',
          'Project Work',
          'Help Mom',
          'Sleep (7-8 hrs)',
          'Sleep'
        ];
        const habitsToDelete = await Habit.find({
          name: { $in: dummyHabitNames.map(n => new RegExp(n, 'i')) }
        });
        const habitIds = habitsToDelete.map(h => h._id);

        if (habitIds.length > 0) {
          const resLogs = await HabitLog.deleteMany({ habitId: { $in: habitIds } });
          console.log(`🧹 Cleaned up ${resLogs.deletedCount} habit logs.`);
          const resHabits = await Habit.deleteMany({ _id: { $in: habitIds } });
          console.log(`🧹 Cleaned up ${resHabits.deletedCount} dummy habits.`);
        }
      } catch (err) {
        console.error('❌ Error during dummy data cleanup:', err);
      }
    };
    await deleteDummyData();

    await seedGlobalQuotes();

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

startServer();
