import { TimetableBlock } from '../models/TimetableBlock';
import { TimetableDayMeta } from '../models/TimetableDayMeta';
import { Types } from 'mongoose';

export const getOrCreateBlocks = async (userId: Types.ObjectId | string, dateStr: string) => {
  // 1. Check if blocks already exist for this date
  const existingBlocks = await TimetableBlock.find({ userId, date: dateStr }).sort({ order: 1, startTime: 1 });
  if (existingBlocks.length > 0) {
    return existingBlocks;
  }

  // 2. Check if this date was already initialized/visited
  const meta = await TimetableDayMeta.findOne({ userId, date: dateStr });
  if (meta) {
    // Already visited/initialized, and currently has 0 blocks (user might have cleared it)
    return [];
  }

  // 3. Not initialized yet. Mark it as initialized.
  try {
    await TimetableDayMeta.create({ userId, date: dateStr });
  } catch (err) {
    // Catch potential duplicate key error from concurrent queries
  }

  // 4. Find the most recent date with timetable blocks
  const latestBlock = await TimetableBlock.findOne({ userId }).sort({ date: -1 });
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
