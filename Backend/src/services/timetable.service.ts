import { TimetableBlock } from '../models/TimetableBlock';
import { TimetableDayMeta } from '../models/TimetableDayMeta';
import { Types } from 'mongoose';

export const getOrCreateBlocks = async (userId: Types.ObjectId | string, dateStr: string) => {
  // 1. Check if blocks already exist for this date
  const existingBlocks = await TimetableBlock.find({ userId, date: dateStr }).sort({ order: 1, startTime: 1 });
  if (existingBlocks.length > 0) {
    return existingBlocks;
  }

  // 2. Atomically create the meta record — only ONE concurrent request will succeed in creating it
  // (upsert: false here means we try insert; if duplicate key → another request already claimed it)
  let metaCreated = false;
  try {
    const result = await TimetableDayMeta.findOneAndUpdate(
      { userId, date: dateStr },
      { $setOnInsert: { userId, date: dateStr } },
      { upsert: true, new: false } // new:false → returns null when document was just inserted (didn't exist before)
    );
    // result is null  → document was freshly inserted (we are the one who should copy blocks)
    // result is a doc → document already existed (another request beat us, or user cleared it)
    metaCreated = result === null;
  } catch (err) {
    // Duplicate key from a true race condition — another request created it first
    metaCreated = false;
  }

  if (!metaCreated) {
    // Another concurrent request is handling the copy, or the user already visited this day
    return await TimetableBlock.find({ userId, date: dateStr }).sort({ order: 1, startTime: 1 });
  }

  // 3. We are the sole owner of the copy operation. Find the most recent date with timetable blocks.
  const latestBlock = await TimetableBlock.findOne({ userId, date: { $ne: dateStr } }).sort({ date: -1 });
  if (!latestBlock) {
    // No templates/blocks exist at all in database yet
    return [];
  }

  // Copy blocks from that date to the target date
  const sourceBlocks = await TimetableBlock.find({ userId, date: latestBlock.date }).sort({ order: 1, startTime: 1 });
  const copiedBlocks = sourceBlocks.map((block) => {
    return new TimetableBlock({
      userId,
      date: dateStr,
      startTime: block.startTime,
      endTime: block.endTime,
      label: block.label,
      tag: block.tag,
      isDone: false, // Reset completion status
      order: block.order,
    });
  });

  if (copiedBlocks.length > 0) {
    await TimetableBlock.insertMany(copiedBlocks);
    return await TimetableBlock.find({ userId, date: dateStr }).sort({ order: 1, startTime: 1 });
  }

  return [];
};

export const ensureMetaExists = async (userId: Types.ObjectId | string, dateStr: string) => {
  try {
    const meta = await TimetableDayMeta.findOne({ userId, date: dateStr });
    if (!meta) {
      await TimetableDayMeta.create({ userId, date: dateStr });
    }
  } catch (err) {
    // Catch duplicate index errors
  }
};
