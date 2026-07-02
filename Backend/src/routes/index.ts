import { Router } from 'express';
import authRoutes from './auth.routes';
import timetableRoutes from './timetable.routes';
import habitRoutes from './habit.routes';
import goalRoutes from './goal.routes';
import topicRoutes from './topic.routes';
import applicationRoutes from './application.routes';
import quoteRoutes from './quote.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/timetable', timetableRoutes);
router.use('/habits', habitRoutes);
router.use('/goals', goalRoutes);
router.use('/topics', topicRoutes);
router.use('/applications', applicationRoutes);
router.use('/quotes', quoteRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
