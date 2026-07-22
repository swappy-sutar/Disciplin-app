import { Router } from 'express';
import authRoutes from './auth.routes';
import timetableRoutes from './timetable.routes';
import habitRoutes from './habit.routes';
import goalRoutes from './goal.routes';
import topicRoutes from './topic.routes';
import applicationRoutes from './application.routes';
import quoteRoutes from './quote.routes';
import dashboardRoutes from './dashboard.routes';
import noteRoutes from './note.routes';
import qaRoutes from './qa.routes';
import codingRoutes from './coding.routes';
import contactRoutes from './contact.routes';
import workoutRoutes from './workout.routes';
import reviewRoutes from './review.routes';
import adminRoutes from './admin.routes';
import notificationRoutes from './notification.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/timetable', timetableRoutes);
router.use('/habits', habitRoutes);
router.use('/goals', goalRoutes);
router.use('/topics', topicRoutes);
router.use('/applications', applicationRoutes);
router.use('/quotes', quoteRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notes', noteRoutes);
router.use('/qa', qaRoutes);
router.use('/coding', codingRoutes);
router.use('/contact', contactRoutes);
router.use('/workouts', workoutRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);

export default router;
