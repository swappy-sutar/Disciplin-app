import { Note } from '../models/Note';
import { checkTopicOwnership } from './interview-prep.service';
import { NotFoundError } from '../utils/custom-errors';

export const getNotesByTopic = async (userId: string, topicId: string) => {
  await checkTopicOwnership(topicId, userId);
  return Note.find({ topicId, userId }).sort({ createdAt: -1 }).lean();
};

export const createNote = async (userId: string, topicId: string, data: any) => {
  await checkTopicOwnership(topicId, userId);
  const note = new Note({
    ...data,
    topicId,
    userId,
  });
  return note.save();
};

export const updateNote = async (userId: string, noteId: string, data: any) => {
  const note = await Note.findById(noteId);
  if (!note) {
    throw new NotFoundError('Note not found');
  }
  await checkTopicOwnership(note.topicId.toString(), userId);
  
  Object.assign(note, data);
  return note.save();
};

export const deleteNote = async (userId: string, noteId: string) => {
  const note = await Note.findById(noteId);
  if (!note) {
    throw new NotFoundError('Note not found');
  }
  await checkTopicOwnership(note.topicId.toString(), userId);
  
  await note.deleteOne();
  return { success: true };
};
