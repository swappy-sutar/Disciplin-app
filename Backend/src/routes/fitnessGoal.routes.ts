import { Router } from 'express';
import {
  createFitnessGoal,
  getActiveFitnessGoal,
  logBodyMetric,
  getBodyMetrics,
} from '../controllers/fitnessGoal.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createFitnessGoalSchema,
  createBodyMetricSchema,
  getBodyMetricsQuerySchema,
} from '../validations/fitnessGoalAi.validation';

const router = Router();

router.use(protect);

// Fitness Goals
router.post('/fitness-goals', validate(createFitnessGoalSchema), createFitnessGoal);
router.get('/fitness-goals/active', getActiveFitnessGoal);

// Body Metrics
router.post('/body-metrics', validate(createBodyMetricSchema), logBodyMetric);
router.get('/body-metrics', validate(getBodyMetricsQuerySchema), getBodyMetrics);

export default router;
