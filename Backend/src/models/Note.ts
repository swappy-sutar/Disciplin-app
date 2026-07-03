import { Schema, model, Document, Types } from 'mongoose';

export interface INote extends Document {
  topicId: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  bodyMarkdown: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    bodyMarkdown: { type: String, default: '' },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

NoteSchema.index({ topicId: 1, userId: 1 });

export const Note = model<INote>('Note', NoteSchema);
