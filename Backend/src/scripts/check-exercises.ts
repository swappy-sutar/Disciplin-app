import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Exercise } from '../models/exercise.model';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function check() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI not set');
    await mongoose.connect(mongoUri);
    
    const count = await Exercise.countDocuments();
    console.log(`Total exercises: ${count}`);

    const counts = await Exercise.aggregate([
      { $group: { _id: '$muscleGroup', count: { $sum: 1 } } }
    ]);
    console.log('\nExercises per muscle group:');
    counts.forEach(c => {
      console.log(` - ${c._id}: ${c.count}`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
