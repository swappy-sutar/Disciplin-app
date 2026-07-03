import { Router } from 'express';
import * as topicController from '../controllers/topic.controller';
import * as noteController from '../controllers/note.controller';
import * as qaController from '../controllers/qa.controller';
import * as codingController from '../controllers/coding.controller';
import * as prepController from '../controllers/interview-prep-topic.controller';
import { validate } from '../middlewares/validate.middleware';
import { createTopicSchema, updateTopicSchema } from '../validations/topic.validation';
import { 
  createNoteSchema, 
  createQAItemSchema, 
  createCodingQuestionSchema 
} from '../validations/interview-prep.validation';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', topicController.getTopics);
router.post('/', validate(createTopicSchema), topicController.createTopic);
router.patch('/:id', validate(updateTopicSchema), topicController.updateTopic);
router.delete('/:id', topicController.deleteTopic);

// Note sub-routes
router.get('/:topicId/notes', noteController.getNotesByTopic);
router.post('/:topicId/notes', validate(createNoteSchema), noteController.createNote);

// QA sub-routes
router.get('/:topicId/qa', qaController.getQAsByTopic);
router.post('/:topicId/qa', validate(createQAItemSchema), qaController.createQA);

// Coding sub-routes
router.get('/:topicId/coding', codingController.getCodingsByTopic);
router.post('/:topicId/coding', validate(createCodingQuestionSchema), codingController.createCoding);

// Aggregate sub-routes
router.get('/:topicId/detail', prepController.getTopicDetail);
router.get('/:topicId/review', prepController.getTopicReview);

export default router;
