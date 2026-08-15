import { Router } from 'express';
import { generateCoverLetter, generateResumeBullets, generateStudyPlan } from '../controllers/ai.controller';
import { protect } from '../middlewares/auth.middleware';
import { aiRateLimiter } from '../middlewares/aiRateLimiter';
import { validate } from '../middlewares/validate.middleware';
import { coverLetterSchema, resumeBulletsSchema, studyPlanSchema } from '../validations/ai.validation';

const router = Router();

router.use(protect);
router.use(aiRateLimiter);

router.post('/cover-letter', validate(coverLetterSchema), generateCoverLetter);
router.post('/resume-bullets', validate(resumeBulletsSchema), generateResumeBullets);
router.post('/study-plan', validate(studyPlanSchema), generateStudyPlan);

import workoutAiRoutes from './workoutAi.routes';
import goalAiRoutes from './goalAi.routes';

router.use(workoutAiRoutes);
router.use(goalAiRoutes);

export default router;
