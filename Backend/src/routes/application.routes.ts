import { Router } from 'express';
import * as applicationController from '../controllers/application.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  getApplicationsSchema,
  createApplicationSchema,
  updateApplicationSchema,
} from '../validations/application.validation';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', validate(getApplicationsSchema), applicationController.getApplications);
router.post('/', validate(createApplicationSchema), applicationController.createApplication);
router.patch('/:id', validate(updateApplicationSchema), applicationController.updateApplication);
router.delete('/:id', applicationController.deleteApplication);
router.get('/stats', applicationController.getStats);

export default router;
