import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { createTestUser } from '../helpers/authHelper';
import { Exercise } from '../../src/models/Exercise';

describe('Workouts & Splits Module (/api/v1/workouts/*)', () => {
  it('should list exercise library with equipment and muscle group filter', async () => {
    const { authHeader } = await createTestUser();

    await Exercise.create([
      { name: 'Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', slug: 'barbell-bench-press' },
      { name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbell', slug: 'incline-dumbbell-press' },
      { name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Cable', slug: 'lat-pulldown' },
    ]);

    // Equipment query
    const resEquipment = await request(app)
      .get('/api/v1/workouts/exercises?equipment=Barbell')
      .set(authHeader);

    expect(resEquipment.status).toBe(200);
    expect(resEquipment.body.data.some((e: any) => e.name === 'Barbell Bench Press')).toBe(true);

    // Muscle group filter
    const resMuscle = await request(app)
      .get('/api/v1/workouts/exercises?muscleGroup=Back')
      .set(authHeader);

    expect(resMuscle.status).toBe(200);
    expect(resMuscle.body.data.length).toBe(1);
    expect(resMuscle.body.data[0].name).toBe('Lat Pulldown');
  });

  it('should get and update workout split schedule', async () => {
    const { authHeader } = await createTestUser();

    // Default auto-created split
    const getRes = await request(app)
      .get('/api/v1/workouts/split')
      .set(authHeader);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.weekMap).toBeDefined();

    // Update split
    const newWeekMap = {
      monday: 'Chest',
      tuesday: 'Back',
      wednesday: 'Legs',
      thursday: 'Shoulders',
      friday: 'FullBody',
      saturday: 'rest',
      sunday: 'rest',
    };

    const updateRes = await request(app)
      .put('/api/v1/workouts/split')
      .set(authHeader)
      .send({ weekMap: newWeekMap });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.weekMap.monday).toBe('Chest');
  });

  it('should log a completed workout session and retrieve history and streaks', async () => {
    const { authHeader } = await createTestUser();

    const ex = await Exercise.create({
      name: 'Overhead Press',
      muscleGroup: 'Shoulders',
      equipment: 'Barbell',
      slug: 'overhead-press-test',
    });

    const date = '2026-08-17';
    const logRes = await request(app)
      .post('/api/v1/workouts/session')
      .set(authHeader)
      .send({
        date,
        muscleGroup: 'Shoulders',
        exercises: [
          {
            exerciseId: ex._id.toString(),
            sets: [
              { setNumber: 1, reps: 10, weightKg: 50, completed: true },
              { setNumber: 2, reps: 8, weightKg: 55, completed: true },
            ],
            notes: 'Strong shoulder session',
          },
        ],
        completed: true,
        durationMinutes: 45,
      });

    expect(logRes.status).toBe(200);
    expect(logRes.body.success).toBe(true);

    // Fetch history
    const historyRes = await request(app)
      .get('/api/v1/workouts/sessions')
      .set(authHeader);

    expect(historyRes.status).toBe(200);
    expect(historyRes.body.data.length).toBe(1);
    expect(historyRes.body.data[0].muscleGroup).toBe('Shoulders');

    // Fetch streak
    const streakRes = await request(app)
      .get('/api/v1/workouts/streak')
      .set(authHeader);

    expect(streakRes.status).toBe(200);
    expect(streakRes.body.data.currentStreak).toBeGreaterThanOrEqual(1);
  });
});
