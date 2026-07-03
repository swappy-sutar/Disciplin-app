import { Router } from 'express';
import * as noteController from '../controllers/note.controller';
import { validate } from '../middlewares/validate.middleware';
import { updateNoteSchema } from '../validations/interview-prep.validation';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.patch('/:id', validate(updateNoteSchema), noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

export default router;
