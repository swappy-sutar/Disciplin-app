import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Exercise } from '../models/exercise.model';

// Load .env relative to scripts folder
dotenv.config({ path: path.join(__dirname, '../../.env') });

export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Legs'
  | 'Glutes'
  | 'Core'
  | 'Cardio'
  | 'FullBody';

export type EquipmentType = 'Dumbbell' | 'Machine' | 'Barbell' | 'Bodyweight' | 'Kettlebell' | 'Bands';

export interface ExerciseSeed {
  name: string;
  muscleGroup: MuscleGroup;
  equipment: EquipmentType;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  imageUrl: string;
  gifUrl: string;
  instructions: string[];
  slug: string;
}

export const exerciseSeedData: ExerciseSeed[] = [
  { name: 'Dumbbell Bench Press', muscleGroup: 'Chest', equipment: 'Dumbbell', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-bench-press' },
  { name: 'Dumbbell Incline Press', muscleGroup: 'Chest', equipment: 'Dumbbell', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-incline-press' },
  { name: 'Dumbbell Decline Press', muscleGroup: 'Chest', equipment: 'Dumbbell', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-decline-press' },
  { name: 'Dumbbell Fly', muscleGroup: 'Chest', equipment: 'Dumbbell', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-fly' },
  { name: 'Dumbbell Incline Fly', muscleGroup: 'Chest', equipment: 'Dumbbell', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-incline-fly' },
  { name: 'Dumbbell Pullover', muscleGroup: 'Chest', equipment: 'Dumbbell', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-pullover' },
  { name: 'Dumbbell Floor Press', muscleGroup: 'Chest', equipment: 'Dumbbell', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-floor-press' },
  { name: 'Single-Arm Dumbbell Row', muscleGroup: 'Back', equipment: 'Dumbbell', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'single-arm-dumbbell-row' },
  { name: 'Dumbbell Bent-Over Row', muscleGroup: 'Back', equipment: 'Dumbbell', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-bent-over-row' },
  { name: 'Dumbbell Renegade Row', muscleGroup: 'Back', equipment: 'Dumbbell', difficulty: 'advanced', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-renegade-row' },
  { name: 'Dumbbell Shrug', muscleGroup: 'Back', equipment: 'Dumbbell', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-shrug' },
  { name: 'Dumbbell Deadlift', muscleGroup: 'Back', equipment: 'Dumbbell', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-deadlift' },
  { name: 'Dumbbell Romanian Deadlift', muscleGroup: 'Back', equipment: 'Dumbbell', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-romanian-deadlift' },
  { name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Dumbbell', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-shoulder-press' },
  { name: 'Arnold Press', muscleGroup: 'Shoulders', equipment: 'Dumbbell', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'arnold-press' },
  { name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbell', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-lateral-raise' },
  { name: 'Dumbbell Front Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbell', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-front-raise' },
  { name: 'Dumbbell Rear Delt Fly', muscleGroup: 'Shoulders', equipment: 'Dumbbell', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-rear-delt-fly' },
  { name: 'Dumbbell Upright Row', muscleGroup: 'Shoulders', equipment: 'Dumbbell', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-upright-row' },
  { name: 'Dumbbell Bicep Curl', muscleGroup: 'Biceps', equipment: 'Dumbbell', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-bicep-curl' },
  { name: 'Hammer Curl', muscleGroup: 'Biceps', equipment: 'Dumbbell', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'hammer-curl' },
  { name: 'Concentration Curl', muscleGroup: 'Biceps', equipment: 'Dumbbell', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'concentration-curl' },
  { name: 'Incline Dumbbell Curl', muscleGroup: 'Biceps', equipment: 'Dumbbell', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'incline-dumbbell-curl' },
  { name: 'Zottman Curl', muscleGroup: 'Biceps', equipment: 'Dumbbell', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'zottman-curl' },
  { name: 'Cross-Body Hammer Curl', muscleGroup: 'Biceps', equipment: 'Dumbbell', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'cross-body-hammer-curl' },
  { name: 'Dumbbell Overhead Tricep Extension', muscleGroup: 'Triceps', equipment: 'Dumbbell', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-overhead-tricep-extension' },
  { name: 'Dumbbell Skull Crusher', muscleGroup: 'Triceps', equipment: 'Dumbbell', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-skull-crusher' },
  { name: 'Dumbbell Kickback', muscleGroup: 'Triceps', equipment: 'Dumbbell', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-kickback' },
  { name: 'Single-Arm Overhead Extension', muscleGroup: 'Triceps', equipment: 'Dumbbell', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'single-arm-overhead-extension' },
  { name: 'Close-Grip Dumbbell Press', muscleGroup: 'Triceps', equipment: 'Dumbbell', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'close-grip-dumbbell-press' },
  { name: 'Dumbbell Goblet Squat', muscleGroup: 'Legs', equipment: 'Dumbbell', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-goblet-squat' },
  { name: 'Dumbbell Lunge', muscleGroup: 'Legs', equipment: 'Dumbbell', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-lunge' },
  { name: 'Dumbbell Walking Lunge', muscleGroup: 'Legs', equipment: 'Dumbbell', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-walking-lunge' },
  { name: 'Dumbbell Step-Up', muscleGroup: 'Legs', equipment: 'Dumbbell', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-step-up' },
  { name: 'Dumbbell Bulgarian Split Squat', muscleGroup: 'Legs', equipment: 'Dumbbell', difficulty: 'advanced', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-bulgarian-split-squat' },
  { name: 'Dumbbell Sumo Squat', muscleGroup: 'Legs', equipment: 'Dumbbell', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-sumo-squat' },
  { name: 'Dumbbell Hip Thrust', muscleGroup: 'Glutes', equipment: 'Dumbbell', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-hip-thrust' },
  { name: 'Dumbbell Glute Bridge', muscleGroup: 'Glutes', equipment: 'Dumbbell', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-glute-bridge' },
  { name: 'Dumbbell Curtsy Lunge', muscleGroup: 'Glutes', equipment: 'Dumbbell', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-curtsy-lunge' },
  { name: 'Dumbbell Russian Twist', muscleGroup: 'Core', equipment: 'Dumbbell', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-russian-twist' },
  { name: 'Dumbbell Side Bend', muscleGroup: 'Core', equipment: 'Dumbbell', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-side-bend' },
  { name: 'Weighted Sit-Up', muscleGroup: 'Core', equipment: 'Dumbbell', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'weighted-sit-up' },
  { name: 'Dumbbell Woodchopper', muscleGroup: 'Core', equipment: 'Dumbbell', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-woodchopper' },
  { name: 'Dumbbell Thruster', muscleGroup: 'FullBody', equipment: 'Dumbbell', difficulty: 'advanced', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-thruster' },
  { name: 'Dumbbell Man Maker', muscleGroup: 'FullBody', equipment: 'Dumbbell', difficulty: 'advanced', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-man-maker' },
  { name: 'Dumbbell Clean and Press', muscleGroup: 'FullBody', equipment: 'Dumbbell', difficulty: 'advanced', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-clean-and-press' },
  { name: 'Dumbbell Snatch', muscleGroup: 'FullBody', equipment: 'Dumbbell', difficulty: 'advanced', imageUrl: '', gifUrl: '', instructions: [], slug: 'dumbbell-snatch' },
  { name: 'Chest Press Machine', muscleGroup: 'Chest', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'chest-press-machine' },
  { name: 'Pec Deck Machine', muscleGroup: 'Chest', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'pec-deck-machine' },
  { name: 'Incline Chest Press Machine', muscleGroup: 'Chest', equipment: 'Machine', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'incline-chest-press-machine' },
  { name: 'Cable Crossover', muscleGroup: 'Chest', equipment: 'Machine', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'cable-crossover' },
  { name: 'Lat Pulldown Machine', muscleGroup: 'Back', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'lat-pulldown-machine' },
  { name: 'Seated Cable Row', muscleGroup: 'Back', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'seated-cable-row' },
  { name: 'T-Bar Row Machine', muscleGroup: 'Back', equipment: 'Machine', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 't-bar-row-machine' },
  { name: 'Assisted Pull-Up Machine', muscleGroup: 'Back', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'assisted-pull-up-machine' },
  { name: 'Chest-Supported Machine Row', muscleGroup: 'Back', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'chest-supported-machine-row' },
  { name: 'Machine Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'machine-shoulder-press' },
  { name: 'Machine Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'machine-lateral-raise' },
  { name: 'Reverse Pec Deck', muscleGroup: 'Shoulders', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'reverse-pec-deck' },
  { name: 'Preacher Curl Machine', muscleGroup: 'Biceps', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'preacher-curl-machine' },
  { name: 'Cable Bicep Curl', muscleGroup: 'Biceps', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'cable-bicep-curl' },
  { name: 'Machine Bicep Curl', muscleGroup: 'Biceps', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'machine-bicep-curl' },
  { name: 'Tricep Pushdown', muscleGroup: 'Triceps', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'tricep-pushdown' },
  { name: 'Assisted Dip Machine', muscleGroup: 'Triceps', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'assisted-dip-machine' },
  { name: 'Overhead Cable Tricep Extension', muscleGroup: 'Triceps', equipment: 'Machine', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'overhead-cable-tricep-extension' },
  { name: 'Leg Press Machine', muscleGroup: 'Legs', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'leg-press-machine' },
  { name: 'Leg Extension Machine', muscleGroup: 'Legs', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'leg-extension-machine' },
  { name: 'Seated Leg Curl Machine', muscleGroup: 'Legs', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'seated-leg-curl-machine' },
  { name: 'Lying Leg Curl Machine', muscleGroup: 'Legs', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'lying-leg-curl-machine' },
  { name: 'Hack Squat Machine', muscleGroup: 'Legs', equipment: 'Machine', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'hack-squat-machine' },
  { name: 'Smith Machine Squat', muscleGroup: 'Legs', equipment: 'Machine', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'smith-machine-squat' },
  { name: 'Seated Calf Raise Machine', muscleGroup: 'Legs', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'seated-calf-raise-machine' },
  { name: 'Standing Calf Raise Machine', muscleGroup: 'Legs', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'standing-calf-raise-machine' },
  { name: 'Hip Thrust Machine', muscleGroup: 'Glutes', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'hip-thrust-machine' },
  { name: 'Glute Kickback Machine', muscleGroup: 'Glutes', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'glute-kickback-machine' },
  { name: 'Cable Glute Kickback', muscleGroup: 'Glutes', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'cable-glute-kickback' },
  { name: 'Hip Abductor Machine', muscleGroup: 'Glutes', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'hip-abductor-machine' },
  { name: 'Hip Adductor Machine', muscleGroup: 'Glutes', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'hip-adductor-machine' },
  { name: 'Ab Crunch Machine', muscleGroup: 'Core', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'ab-crunch-machine' },
  { name: 'Cable Woodchopper', muscleGroup: 'Core', equipment: 'Machine', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'cable-woodchopper' },
  { name: 'Rotary Torso Machine', muscleGroup: 'Core', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'rotary-torso-machine' },
  { name: 'Treadmill', muscleGroup: 'Cardio', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'treadmill' },
  { name: 'Stationary Bike', muscleGroup: 'Cardio', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'stationary-bike' },
  { name: 'Rowing Machine', muscleGroup: 'Cardio', equipment: 'Machine', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'rowing-machine' },
  { name: 'Elliptical Trainer', muscleGroup: 'Cardio', equipment: 'Machine', difficulty: 'beginner', imageUrl: '', gifUrl: '', instructions: [], slug: 'elliptical-trainer' },
  { name: 'StairMaster', muscleGroup: 'Cardio', equipment: 'Machine', difficulty: 'intermediate', imageUrl: '', gifUrl: '', instructions: [], slug: 'stairmaster' }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not set in environment or .env');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clean up existing seeded exercises first (optional, or skip if already seeded)
    // Wait, let's clean up existing exercises first to replace them with this comprehensive list!
    await Exercise.deleteMany({});
    console.log('Cleared existing exercises.');

    const result = await Exercise.insertMany(exerciseSeedData);
    console.log(`Seeded ${result.length} exercises successfully.`);

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

// Call seed directly if run via CLI
if (require.main === module) {
  seed();
}
