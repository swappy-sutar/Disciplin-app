import { CodingQuestion } from '../models/CodingQuestion';
import { checkTopicOwnership } from './interview-prep.service';
import { NotFoundError } from '../utils/custom-errors';

export const getCodingsByTopic = async (userId: string, topicId: string) => {
  await checkTopicOwnership(topicId, userId);
  return CodingQuestion.find({ topicId, userId }).sort({ createdAt: -1 });
};

export const createCoding = async (userId: string, topicId: string, data: any) => {
  await checkTopicOwnership(topicId, userId);
  const coding = new CodingQuestion({
    ...data,
    topicId,
    userId,
  });
  return coding.save();
};

export const updateCoding = async (userId: string, codingId: string, data: any) => {
  const coding = await CodingQuestion.findById(codingId);
  if (!coding) {
    throw new NotFoundError('CodingQuestion not found');
  }
  await checkTopicOwnership(coding.topicId.toString(), userId);
  
  Object.assign(coding, data);
  return coding.save();
};

export const deleteCoding = async (userId: string, codingId: string) => {
  const coding = await CodingQuestion.findById(codingId);
  if (!coding) {
    throw new NotFoundError('CodingQuestion not found');
  }
  await checkTopicOwnership(coding.topicId.toString(), userId);
  
  await coding.deleteOne();
  return { success: true };
};
