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

import { TimetableBlock } from '../models/TimetableBlock';
import { WeeklyGoal } from '../models/WeeklyGoal';
import { Topic } from '../models/Topic';

export const seedUserProfileData = async (userId: Types.ObjectId | string): Promise<void> => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Get Monday of the current week
    const curr = new Date();
    const first = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1);
    const monday = new Date(curr.setDate(first));
    const mondayStr = monday.toISOString().split('T')[0];

    // 1. Seed Timetable Blocks if empty
    const tbCount = await TimetableBlock.countDocuments({ userId });
    if (tbCount === 0) {
      await TimetableBlock.insertMany([
        { userId, date: todayStr, startTime: '08:00', endTime: '09:00', label: 'Morning Routine', tag: 'Health', isDone: true, order: 1 },
        { userId, date: todayStr, startTime: '09:30', endTime: '11:30', label: 'System Architecture Review', tag: 'Work', isDone: false, order: 2 },
        { userId, date: todayStr, startTime: '12:00', endTime: '13:30', label: 'DSA Practice: Graphs', tag: 'Study', isDone: true, order: 3 },
        { userId, date: todayStr, startTime: '15:00', endTime: '16:00', label: 'Networking Call', tag: 'Personal', isDone: false, order: 4 },
        { userId, date: todayStr, startTime: '19:00', endTime: '20:30', label: 'Project Deployment', tag: 'Work', isDone: false, order: 5 },
      ]);
      console.log(`🌱 Seeded default timetable blocks for user ${userId}`);
    }

    // 2. Seed Weekly Goals if empty
    const wgCount = await WeeklyGoal.countDocuments({ userId });
    if (wgCount === 0) {
      await WeeklyGoal.insertMany([
        { userId, weekStartDate: mondayStr, title: 'Complete Portfolio UI', isDone: true, dueDay: 'Wednesday' },
        { userId, weekStartDate: mondayStr, title: 'Apply to 20 Jobs', isDone: true, dueDay: 'Friday' },
        { userId, weekStartDate: mondayStr, title: 'Finish 10 DSA Medium', isDone: false, dueDay: 'Saturday' },
        { userId, weekStartDate: mondayStr, title: 'Practice System Design', isDone: false, dueDay: 'Sunday' },
      ]);
      console.log(`🌱 Seeded default weekly goals for user ${userId}`);
    }

    // 3. Seed Topics if empty
    const topicCount = await Topic.countDocuments({ userId });
    if (topicCount === 0) {
      await Topic.insertMany([
        {
          userId,
          title: 'Graph Algorithms & Theory',
          category: 'Computer Science',
          subTopics: [
            { title: 'BFS & DFS Traversal', isDone: true },
            { title: "Dijkstra's Algorithm", isDone: true },
            { title: "Prim's & Kruskal's MST", isDone: true },
            { title: 'Bellman-Ford & Floyd-Warshall', isDone: false },
            { title: 'Topological Sorting', isDone: false },
          ]
        },
        {
          userId,
          title: 'System Design & Scale',
          category: 'System Architecture',
          subTopics: [
            { title: 'Load Balancers & Reverse Proxies', isDone: true },
            { title: 'Caching Strategies (Redis/Memcached)', isDone: true },
            { title: 'Database Sharding & Replication', isDone: false },
            { title: 'Message Queues & Event Streaming', isDone: false },
            { title: 'CDN & Edge Computing', isDone: false },
          ]
        },
        {
          userId,
          title: 'React & Frontend Architecture',
          category: 'Frontend Engineering',
          subTopics: [
            { title: 'React 18 Concurrent Rendering', isDone: true },
            { title: 'Zustand & State Management', isDone: true },
            { title: 'TanStack Query Data Fetching', isDone: true },
          ]
        }
      ]);
      console.log(`🌱 Seeded default topics for user ${userId}`);
    }
  } catch (error) {
    console.error(`❌ Error seeding profile data for user ${userId}:`, error);
  }
};
