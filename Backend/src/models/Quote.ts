import { Schema, model, Document, Types } from 'mongoose';

export interface IQuote extends Document {
  text: string;
  author: string;
  isFavorite: boolean;
  isCustom: boolean;
  userId?: Types.ObjectId; // Nullable for global quotes
  createdAt: Date;
}

const QuoteSchema = new Schema<IQuote>({
  text: { type: String, required: true, trim: true },
  author: { type: String, default: 'Unknown', trim: true },
  isFavorite: { type: Boolean, default: false },
  isCustom: { type: Boolean, default: false },
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  createdAt: { type: Date, default: Date.now },
});

export const Quote = model<IQuote>('Quote', QuoteSchema);
