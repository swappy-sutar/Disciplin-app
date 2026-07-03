import { QAItem } from '../models/QAItem';
import { checkTopicOwnership } from './interview-prep.service';
import { NotFoundError } from '../utils/custom-errors';

export const getQAsByTopic = async (userId: string, topicId: string) => {
  await checkTopicOwnership(topicId, userId);
  return QAItem.find({ topicId, userId }).sort({ createdAt: -1 });
};

export const createQA = async (userId: string, topicId: string, data: any) => {
  await checkTopicOwnership(topicId, userId);
  const qa = new QAItem({
    ...data,
    topicId,
    userId,
  });
  return qa.save();
};

export const updateQA = async (userId: string, qaId: string, data: any) => {
  const qa = await QAItem.findById(qaId);
  if (!qa) {
    throw new NotFoundError('QAItem not found');
  }
  await checkTopicOwnership(qa.topicId.toString(), userId);
  
  Object.assign(qa, data);
  return qa.save();
};

export const deleteQA = async (userId: string, qaId: string) => {
  const qa = await QAItem.findById(qaId);
  if (!qa) {
    throw new NotFoundError('QAItem not found');
  }
  await checkTopicOwnership(qa.topicId.toString(), userId);
  
  await qa.deleteOne();
  return { success: true };
};
