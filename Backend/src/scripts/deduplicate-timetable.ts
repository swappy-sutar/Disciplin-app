/**
 * One-time script to remove duplicate TimetableBlock entries.
 * Keeps the first (oldest) block for each unique (userId, date, startTime, endTime, label) combo.
 * Run with: npx ts-node -r tsconfig-paths/register src/scripts/deduplicate-timetable.ts
 */

import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { TimetableBlock } from '../models/TimetableBlock';

const deduplicateTimetable = async () => {
  await connectDB();
  console.log('🔍 Scanning for duplicate timetable blocks...');

  // Group all blocks by (userId, date, startTime, endTime, label)
  const duplicates = await TimetableBlock.aggregate([
    {
      $group: {
        _id: { userId: '$userId', date: '$date', startTime: '$startTime', endTime: '$endTime', label: '$label' },
        count: { $sum: 1 },
        ids: { $push: '$_id' },
        firstId: { $first: '$_id' }, // keep the oldest (first inserted)
      },
    },
    { $match: { count: { $gt: 1 } } },
  ]);

  if (duplicates.length === 0) {
    console.log('✅ No duplicate blocks found. Database is clean.');
    await mongoose.disconnect();
    return;
  }

  console.log(`⚠️  Found ${duplicates.length} groups with duplicates. Removing extras...`);

  let totalRemoved = 0;
  for (const group of duplicates) {
    // Remove all ids EXCEPT the first one (keep firstId)
    const idsToRemove = group.ids.filter((id: mongoose.Types.ObjectId) => !id.equals(group.firstId));
    const result = await TimetableBlock.deleteMany({ _id: { $in: idsToRemove } });
    totalRemoved += result.deletedCount;
    console.log(
      `  Cleaned (${group._id.date} | ${group._id.startTime}-${group._id.endTime} | ${group._id.label}): removed ${result.deletedCount} duplicates`
    );
  }

  console.log(`\n✅ Done! Removed ${totalRemoved} duplicate blocks total.`);
  await mongoose.disconnect();
};

deduplicateTimetable().catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
