import { Router } from 'express';
import * as codingController from '../controllers/coding.controller';
import { validate } from '../middlewares/validate.middleware';
import { updateCodingQuestionSchema } from '../validations/interview-prep.validation';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.patch('/:id', validate(updateCodingQuestionSchema), codingController.updateCoding);
router.delete('/:id', codingController.deleteCoding);

export default router;
