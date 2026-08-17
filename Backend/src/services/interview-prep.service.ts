import { Topic } from '../models/Topic';
import { Note } from '../models/Note';
import { QAItem } from '../models/QAItem';
import { CodingQuestion } from '../models/CodingQuestion';
import { ForbiddenError, NotFoundError } from '../utils/custom-errors';

export const checkTopicOwnership = async (topicId: string, userId: string) => {
  const topic = await Topic.findById(topicId).select('userId title category progressPercent').lean();
  if (!topic) {
    throw new NotFoundError('Topic not found');
  }
  if (topic.userId.toString() !== userId) {
    throw new ForbiddenError('You do not own this topic');
  }
  return topic;
};

export const getTopicDetail = async (userId: string, topicId: string) => {
  const topic = await checkTopicOwnership(topicId, userId);

  const [notes, qaItems, codingQuestions] = await Promise.all([
    Note.find({ topicId, userId }).sort({ createdAt: -1 }).lean(),
    QAItem.find({ topicId, userId }).sort({ createdAt: -1 }).lean(),
    CodingQuestion.find({ topicId, userId }).sort({ createdAt: -1 }).lean(),
  ]);

  return {
    topic,
    notes,
    qaItems,
    codingQuestions,
  };
};

export const getTopicReview = async (userId: string, topicId: string, filterWeak: boolean) => {
  await checkTopicOwnership(topicId, userId);

  const queryFilter: any = { topicId, userId };
  if (filterWeak) {
    queryFilter.confidence = 'weak';
  }

  const [qaItems, codingQuestions] = await Promise.all([
    QAItem.find(queryFilter).lean(),
    CodingQuestion.find(queryFilter).lean(),
  ]);

  const taggedQa = qaItems.map(item => ({
    ...item,
    type: 'qa' as const,
  }));
  const taggedCoding = codingQuestions.map(item => ({
    ...item,
    type: 'coding' as const,
  }));

  const combined = [...taggedQa, ...taggedCoding];
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined;
};
