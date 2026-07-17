import { Router } from 'express';
import * as contactController from '../controllers/contact.controller';
import { validate } from '../middlewares/validate.middleware';
import { submitContactSchema } from '../validations/contact.validation';

const router = Router();

router.post('/', validate(submitContactSchema), contactController.submitContact);

export default router;
