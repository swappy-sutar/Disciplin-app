import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Exercise } from '../models/exercise.model';

// Load .env relative to scripts folder
dotenv.config({ path: path.join(__dirname, '../../.env') });

const FREE_DB_JSON_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

// Helper to normalize strings for comparison
const normalize = (str: string) => {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
};

async function backfill() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not set in environment or .env');
    }

    // Connect to database
    await mongoose.connect(mongoUri);
    console.log('📡 Connected to MongoDB');

    // Fetch the free-exercise-db JSON
    console.log(`🌐 Fetching exercise dataset from ${FREE_DB_JSON_URL}...`);
    const response = await fetch(FREE_DB_JSON_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch dataset: ${response.statusText}`);
    }
    const externalExercises = (await response.json()) as any[];
    console.log(`✅ Loaded ${externalExercises.length} exercises from external database.`);

    // Build a map of normalized name to external exercise object for O(1) lookups
    const externalMap = new Map<string, any>();
    externalExercises.forEach((item) => {
      if (item.name) {
        externalMap.set(normalize(item.name), item);
      }
    });

    // Fetch our exercises in the DB
    const dbExercises = await Exercise.find({});
    console.log(`🔍 Scanning ${dbExercises.length} database exercises for match...`);

    let matchedCount = 0;
    let fallbackMatchedCount = 0;

    for (const doc of dbExercises) {
      const normName = normalize(doc.name);
      let match = externalMap.get(normName);

      // Fallback matching logic (e.g. check if external name contains database name or vice versa)
      if (!match) {
        for (const [key, item] of externalMap.entries()) {
          if (key.includes(normName) || normName.includes(key)) {
            match = item;
            fallbackMatchedCount++;
            break;
          }
        }
      }

      if (match) {
        matchedCount++;
        const updateData: any = {};

        // Backfill images
        if (match.images && match.images.length > 0) {
          updateData.imageUrl = `${IMAGE_BASE_URL}${match.images[0]}`;
          if (match.images.length > 1) {
            updateData.gifUrl = `${IMAGE_BASE_URL}${match.images[1]}`;
          } else {
            updateData.gifUrl = `${IMAGE_BASE_URL}${match.images[0]}`;
          }
        }

        // Backfill instructions if empty
        if ((!doc.instructions || doc.instructions.length === 0) && match.instructions && match.instructions.length > 0) {
          updateData.instructions = match.instructions;
        }

        // Backfill secondary muscles if empty
        if ((!doc.secondaryMuscles || doc.secondaryMuscles.length === 0) && match.secondaryMuscles && match.secondaryMuscles.length > 0) {
          // Capitalize first letter to match our model enum
          updateData.secondaryMuscles = match.secondaryMuscles.map((m: string) => {
            const cap = m.charAt(0).toUpperCase() + m.slice(1);
            // Handle differences in names, e.g. "biceps" to "Biceps", "chest" to "Chest", "lower back" to "Back"
            if (cap === 'Lower back' || cap === 'Lats' || cap === 'Traps') return 'Back';
            if (cap === 'Quads' || cap === 'Hamstrings' || cap === 'Calves') return 'Legs';
            if (cap === 'Abs' || cap === 'Obliques') return 'Core';
            return cap;
          }).filter((m: string) => 
            ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Glutes', 'Core', 'Cardio', 'FullBody'].includes(m)
          );
        }

        await Exercise.updateOne({ _id: doc._id }, { $set: updateData });
        console.log(`  🟢 Matched & Updated: "${doc.name}" -> ${match.name}`);
      } else {
        // Provide standard premium fallbacks for exercises not found in free-exercise-db
        const fallbackImages: Record<string, string> = {
          Chest: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=300&auto=format&fit=crop',
          Back: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=300&auto=format&fit=crop',
          Shoulders: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=300&auto=format&fit=crop',
          Biceps: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=300&auto=format&fit=crop',
          Triceps: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=300&auto=format&fit=crop',
          Legs: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=300&auto=format&fit=crop',
          Glutes: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=300&auto=format&fit=crop',
          Core: 'https://images.unsplash.com/photo-1566241477600-ac026ad43874?q=80&w=300&auto=format&fit=crop',
          Cardio: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=300&auto=format&fit=crop',
          FullBody: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=300&auto=format&fit=crop'
        };

        const groupImg = fallbackImages[doc.muscleGroup] || fallbackImages.FullBody;
        await Exercise.updateOne({ _id: doc._id }, { 
          $set: { 
            imageUrl: groupImg,
            gifUrl: groupImg,
            instructions: doc.instructions.length > 0 ? doc.instructions : ['Perform the exercise under control through a full range of motion.']
          } 
        });
        console.log(`  🟡 No direct match. Applied group fallback for: "${doc.name}" (${doc.muscleGroup})`);
      }
    }

    console.log(`\n🎉 Backfill complete!`);
    console.log(`  - Total matched: ${matchedCount} (including fallback matches: ${fallbackMatchedCount})`);
    console.log(`  - Total processed: ${dbExercises.length}`);

    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Backfill process failed:', error);
    process.exit(1);
  }
}

backfill();
