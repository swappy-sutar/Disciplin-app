import { Router } from 'express';
import * as quoteController from '../controllers/quote.controller';
import { validate } from '../middlewares/validate.middleware';
import { createQuoteSchema, favoriteQuoteSchema } from '../validations/quote.validation';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/today', quoteController.getTodayQuote);
router.post('/', validate(createQuoteSchema), quoteController.createQuote);
router.patch('/:id/favorite', validate(favoriteQuoteSchema), quoteController.toggleFavorite);

export default router;
