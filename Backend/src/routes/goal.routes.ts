import { Router } from 'express';
import * as goalController from '../controllers/goal.controller';
import { validate } from '../middlewares/validate.middleware';
import { getGoalsSchema, createGoalSchema, updateGoalSchema } from '../validations/goal.validation';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/history', goalController.getGoalsHistory);
router.get('/', validate(getGoalsSchema), goalController.getGoals);
router.post('/', validate(createGoalSchema), goalController.createGoal);
router.patch('/:id', validate(updateGoalSchema), goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);

export default router;
