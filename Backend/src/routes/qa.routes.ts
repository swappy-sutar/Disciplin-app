import { Router } from 'express';
import * as qaController from '../controllers/qa.controller';
import { validate } from '../middlewares/validate.middleware';
import { updateQAItemSchema } from '../validations/interview-prep.validation';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.patch('/:id', validate(updateQAItemSchema), qaController.updateQA);
router.delete('/:id', qaController.deleteQA);

export default router;
