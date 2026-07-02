import { Router } from 'express';
import * as timetableController from '../controllers/timetable.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  getTimetableSchema,
  createBlockSchema,
  updateBlockSchema,
  copyTemplateSchema,
} from '../validations/timetable.validation';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', validate(getTimetableSchema), timetableController.getBlocks);
router.post('/', validate(createBlockSchema), timetableController.createBlock);
router.patch('/:id', validate(updateBlockSchema), timetableController.updateBlock);
router.delete('/:id', timetableController.deleteBlock);
router.post('/template', validate(copyTemplateSchema), timetableController.copyTemplate);

export default router;
