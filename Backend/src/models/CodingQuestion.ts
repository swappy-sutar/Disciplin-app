import { Schema, model, Document, Types } from 'mongoose';

export interface ICodingQuestion extends Document {
  topicId: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  problemMarkdown: string;
  solutionCode: string;
  solutionLanguage: string;
  approachNotes: string;
  timeComplexity: string;
  spaceComplexity: string;
  difficulty: 'easy' | 'medium' | 'hard';
  sourceUrl?: string;
  confidence: 'weak' | 'ok' | 'strong';
  createdAt: Date;
  updatedAt: Date;
}

const CodingQuestionSchema = new Schema<ICodingQuestion>(
  {
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    problemMarkdown: { type: String, default: '' },
    solutionCode: { type: String, default: '' },
    solutionLanguage: { type: String, default: 'typescript' },
    approachNotes: { type: String, default: '' },
    timeComplexity: { type: String, default: '' },
    spaceComplexity: { type: String, default: '' },
    difficulty: { 
      type: String, 
      enum: ['easy', 'medium', 'hard'], 
      required: true 
    },
    sourceUrl: { type: String },
    confidence: { 
      type: String, 
      enum: ['weak', 'ok', 'strong'], 
      default: 'weak' 
    },
  },
  { timestamps: true }
);

CodingQuestionSchema.index({ topicId: 1, userId: 1, createdAt: -1 });
CodingQuestionSchema.index({ userId: 1, createdAt: -1 });

export const CodingQuestion = model<ICodingQuestion>('CodingQuestion', CodingQuestionSchema);
