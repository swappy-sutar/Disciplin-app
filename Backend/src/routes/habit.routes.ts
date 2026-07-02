import { Router } from 'express';
import * as habitController from '../controllers/habit.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  createHabitSchema,
  updateHabitSchema,
  getLogsSchema,
  toggleLogSchema,
} from '../validations/habit.validation';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', habitController.getHabits);
router.post('/', validate(createHabitSchema), habitController.createHabit);
router.patch('/:id', validate(updateHabitSchema), habitController.updateHabit);
router.delete('/:id', habitController.deleteHabit);
router.get('/logs', validate(getLogsSchema), habitController.getLogs);
router.post('/logs', validate(toggleLogSchema), habitController.toggleLog);

export default router;
