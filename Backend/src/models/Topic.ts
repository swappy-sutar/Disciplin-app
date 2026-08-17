import { Schema, model, Document, Types } from 'mongoose';

export interface ISubTopic {
  title: string;
  isDone: boolean;
}

export interface ITopic extends Document {
  userId: Types.ObjectId;
  title: string;
  category: string;
  progressPercent: number;
  subTopics: ISubTopic[];
  createdAt: Date;
}

const SubTopicSchema = new Schema<ISubTopic>({
  title: { type: String, required: true, trim: true },
  isDone: { type: Boolean, default: false },
});

const TopicSchema = new Schema<ITopic>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true, index: true },
  progressPercent: { type: Number, default: 0, min: 0, max: 100 },
  subTopics: [SubTopicSchema],
  createdAt: { type: Date, default: Date.now },
});

// Pre-save hook to calculate progressPercent from subTopics if there are any
TopicSchema.pre<ITopic>('save', function (next) {
  if (this.subTopics && this.subTopics.length > 0) {
    const completed = this.subTopics.filter(t => t.isDone).length;
    this.progressPercent = Math.round((completed / this.subTopics.length) * 100);
  }
  next();
});

TopicSchema.index({ userId: 1, progressPercent: 1, createdAt: -1 });
TopicSchema.index({ userId: 1, category: 1, createdAt: -1 });
TopicSchema.index({ userId: 1, createdAt: -1 });

export const Topic = model<ITopic>('Topic', TopicSchema);
