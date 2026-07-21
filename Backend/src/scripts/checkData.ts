import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Habit } from '../models/Habit';
import { TimetableBlock } from '../models/TimetableBlock';

async function checkData() {
  try {
    await connectDB();
    const users = await User.find();
    console.log('--- USERS IN DATABASE ---');
    users.forEach(u => {
      console.log(`ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
    });

    console.log('\n--- HABITS IN DATABASE ---');
    const habits = await Habit.find();
    habits.forEach(h => {
      console.log(`ID: ${h._id}, UserId: ${h.userId}, Name: ${h.name}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

checkData();
