import { Router } from 'express';
import { getReviews, createReview } from '../controllers/reviewController';
import { validate } from '../middlewares/validate.middleware';
import { createReviewSchema } from '../validations/review.validation';

const router = Router();

router.get('/', getReviews);
router.post('/', validate(createReviewSchema), createReview);

export default router;
