import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { WorkoutSession } from '../models/WorkoutSession';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function clear() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not set');
    }
    await mongoose.connect(mongoUri);
    const result = await WorkoutSession.deleteMany({});
    console.log(`✅ Cleared ${result.deletedCount} old workout sessions containing orphaned exercise IDs.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

clear();
