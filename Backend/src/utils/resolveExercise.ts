import { Exercise, MuscleGroup, EquipmentType, IExercise } from '../models/Exercise';

const VALID_MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Legs', 'Glutes', 'Core', 'Cardio', 'FullBody',
];

function getValidMuscleGroup(muscleGroupStr: string): MuscleGroup {
  const normalized = muscleGroupStr.trim().toLowerCase();
  if (normalized.includes('chest')) return 'Chest';
  if (normalized.includes('back')) return 'Back';
  if (normalized.includes('shoulder')) return 'Shoulders';
  if (normalized.includes('bicep')) return 'Biceps';
  if (normalized.includes('tricep')) return 'Triceps';
  if (normalized.includes('leg') || normalized.includes('quad') || normalized.includes('hamstring') || normalized.includes('calf')) return 'Legs';
  if (normalized.includes('glute')) return 'Glutes';
  if (normalized.includes('core') || normalized.includes('abs') || normalized.includes('abdominal')) return 'Core';
  if (normalized.includes('cardio') || normalized.includes('run') || normalized.includes('cycling')) return 'Cardio';
  return 'FullBody';
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function resolveExercise(exerciseName: string, muscleGroup: string): Promise<IExercise> {
  const name = exerciseName.trim();
  const slug = generateSlug(name);

  // 1. Exact slug match
  let exercise = await Exercise.findOne({ slug });
  if (exercise) {
    return exercise;
  }

  // 2. Fuzzy name match (case-insensitive substring)
  exercise = await Exercise.findOne({ name: { $regex: new RegExp(`^${escapeRegExp(name)}$`, 'i') } });
  if (exercise) {
    return exercise;
  }

  // Check if name is contained or contains
  exercise = await Exercise.findOne({ name: { $regex: new RegExp(name, 'i') } });
  if (exercise) {
    return exercise;
  }

  // 3. Fallback: Create new custom exercise
  const validMuscleGroup = getValidMuscleGroup(muscleGroup);
  const fallbackSlug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
  
  const newExercise = new Exercise({
    name,
    muscleGroup: validMuscleGroup,
    equipment: 'Bodyweight' as EquipmentType,
    difficulty: 'intermediate',
    instructions: ['Perform with proper form.', 'Control the eccentric phase.'],
    imageUrl: '',
    gifUrl: '',
    slug: fallbackSlug,
  });

  await newExercise.save();
  return newExercise;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
