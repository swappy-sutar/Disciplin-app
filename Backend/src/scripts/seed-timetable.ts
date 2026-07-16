import mongoose from 'mongoose';
import { env } from '../config/env';
import { User } from '../models/User';
import { TimetableBlock } from '../models/TimetableBlock';
import { TimetableDayMeta } from '../models/TimetableDayMeta';

const seedTimetable = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // 1. Find user
    const user = await User.findOne();
    if (!user) {
      console.error('❌ No user found in the database. Please register a user first.');
      process.exit(1);
    }
    console.log(`Found User: ${user.name} (${user.email}), ID: ${user._id}`);

    // Today's date (active date is July 16, 2026)
    const targetDate = '2026-07-16';

    // 2. Clear existing blocks on the target date to avoid duplicates
    await TimetableBlock.deleteMany({ userId: user._id, date: targetDate });
    console.log(`Deleted existing timetable blocks for date: ${targetDate}`);

    // 3. Clear metas and blocks for any future dates so they re-initialize from today's new template
    await TimetableBlock.deleteMany({ userId: user._id, date: { $gt: targetDate } });
    await TimetableDayMeta.deleteMany({ userId: user._id, date: { $gte: targetDate } });
    console.log(`Cleared metas and blocks for dates >= ${targetDate} to enable template auto carry-over.`);

    // 4. Define the polished daily schedule slots
    const dailySchedule = [
      {
        startTime: '06:30',
        endTime: '07:00',
        label: 'Wake Up & Hydrate [Personal]',
        tag: 'Personal' as const,
        order: 1,
      },
      {
        startTime: '07:00',
        endTime: '08:30',
        label: 'Gym Workout [Health]',
        tag: 'Health' as const,
        order: 2,
      },
      {
        startTime: '08:30',
        endTime: '10:30',
        label: 'Morning Routine & Breakfast [Personal]',
        tag: 'Personal' as const,
        order: 3,
      },
      {
        startTime: '10:30',
        endTime: '11:00',
        label: 'Short Break [Personal]',
        tag: 'Personal' as const,
        order: 4,
      },
      {
        startTime: '11:00',
        endTime: '13:30',
        label: 'Backend Interview Preparation [Study]',
        tag: 'Study' as const,
        order: 5,
      },
      {
        startTime: '13:30',
        endTime: '14:30',
        label: 'Lunch Break [Personal]',
        tag: 'Personal' as const,
        order: 6,
      },
      {
        startTime: '14:30',
        endTime: '15:30',
        label: 'Power Nap / Recharge [Health]',
        tag: 'Health' as const,
        order: 7,
      },
      {
        startTime: '15:30',
        endTime: '17:00',
        label: 'Communication Practice & Q&A Research [Study]',
        tag: 'Study' as const,
        order: 8,
      },
      {
        startTime: '17:00',
        endTime: '18:00',
        label: 'Evening Break [Personal]',
        tag: 'Personal' as const,
        order: 9,
      },
      {
        startTime: '18:00',
        endTime: '19:00',
        label: 'English Speaking Practice [Study]',
        tag: 'Study' as const,
        order: 10,
      },
      {
        startTime: '19:00',
        endTime: '20:00',
        label: 'Solve Coding Questions [Study]',
        tag: 'Study' as const,
        order: 11,
      },
      {
        startTime: '20:00',
        endTime: '21:00',
        label: 'Help to Mom [Personal]',
        tag: 'Personal' as const,
        order: 12,
      },
      {
        startTime: '21:00',
        endTime: '22:00',
        label: 'Dinner [Personal]',
        tag: 'Personal' as const,
        order: 13,
      },
      {
        startTime: '22:00',
        endTime: '23:00',
        label: 'Work on Project [Work]',
        tag: 'Work' as const,
        order: 14,
      },
      {
        startTime: '23:00',
        endTime: '23:30',
        label: 'Wind Down & Read [Personal]',
        tag: 'Personal' as const,
        order: 15,
      },
      {
        startTime: '23:30',
        endTime: '06:30',
        label: 'Sleep [Health]',
        tag: 'Health' as const,
        order: 16,
      }
    ];

    // 5. Insert blocks
    const insertData = dailySchedule.map(item => ({
      userId: user._id,
      date: targetDate,
      startTime: item.startTime,
      endTime: item.endTime,
      label: item.label,
      tag: item.tag,
      isDone: false,
      order: item.order,
    }));

    await TimetableBlock.insertMany(insertData);
    console.log(`✅ Successfully seeded ${insertData.length} timetable blocks for ${targetDate}`);

    // Create the meta day tag for today
    await TimetableDayMeta.create({ userId: user._id, date: targetDate });
    console.log(`✅ Created TimetableDayMeta for ${targetDate}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedTimetable();
