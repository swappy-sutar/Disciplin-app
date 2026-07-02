import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/summary', dashboardController.getSummary);

export default router;
