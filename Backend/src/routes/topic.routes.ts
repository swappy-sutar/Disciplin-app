import { Router } from 'express';
import * as topicController from '../controllers/topic.controller';
import { validate } from '../middlewares/validate.middleware';
import { createTopicSchema, updateTopicSchema } from '../validations/topic.validation';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', topicController.getTopics);
router.post('/', validate(createTopicSchema), topicController.createTopic);
router.patch('/:id', validate(updateTopicSchema), topicController.updateTopic);
router.delete('/:id', topicController.deleteTopic);

export default router;
