import { Router } from 'express';
import * as workoutController from '../controllers/workout.controller';
import { validate } from '../middlewares/validate.middleware';
import { updateSplitSchema, saveSessionSchema } from '../validations/workout.validation';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Protect all workout endpoints
router.use(protect);

router.get('/exercises', workoutController.getExercises);
router.get('/exercise-video', workoutController.getExerciseVideo);
router.get('/split', workoutController.getSplit);
router.put('/split', validate(updateSplitSchema), workoutController.updateSplit);
router.get('/session/today', workoutController.getTodaySession);
router.post('/session', validate(saveSessionSchema), workoutController.saveSession);
router.get('/sessions', workoutController.getHistory);
router.get('/streak', workoutController.getStreak);

export default router;
