import { Schema, model, Document, Types } from 'mongoose';

export interface IQAItem extends Document {
  topicId: Types.ObjectId;
  userId: Types.ObjectId;
  question: string;
  answerMarkdown: string;
  frequency: 'common' | 'occasional' | 'rare';
  companyTags: string[];
  confidence: 'weak' | 'ok' | 'strong';
  createdAt: Date;
  updatedAt: Date;
}

const QAItemSchema = new Schema<IQAItem>(
  {
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: String, required: true, trim: true },
    answerMarkdown: { type: String, default: '' },
    frequency: { 
      type: String, 
      enum: ['common', 'occasional', 'rare'], 
      default: 'occasional' 
    },
    companyTags: { type: [String], default: [] },
    confidence: { 
      type: String, 
      enum: ['weak', 'ok', 'strong'], 
      default: 'weak' 
    },
  },
  { timestamps: true }
);

QAItemSchema.index({ topicId: 1, userId: 1, createdAt: -1 });
QAItemSchema.index({ userId: 1, createdAt: -1 });

export const QAItem = model<IQAItem>('QAItem', QAItemSchema);
