import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';

async function makeAdmin() {
  try {
    await connectDB();
    const targetEmail = 'sutarswapnil322@gmail.com';
    
    const user = await User.findOneAndUpdate(
      { email: targetEmail.toLowerCase() },
      { role: 'admin' },
      { new: true }
    );

    if (user) {
      console.log(`✅ SUCCESS: User ${user.email} (${user.name}) role updated to ADMIN!`);
    } else {
      console.log(`⚠️ User with email ${targetEmail} was not found. Updating any user matching case-insensitive search...`);
      const userCase = await User.findOneAndUpdate(
        { email: new RegExp(`^${targetEmail}$`, 'i') },
        { role: 'admin' },
        { new: true }
      );
      if (userCase) {
        console.log(`✅ SUCCESS: User ${userCase.email} (${userCase.name}) role updated to ADMIN!`);
      } else {
        console.log(`❌ User ${targetEmail} not found in database.`);
      }
    }
  } catch (err) {
    console.error('Error in makeAdmin:', err);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

makeAdmin();
