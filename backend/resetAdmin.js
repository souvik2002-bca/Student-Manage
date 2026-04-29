require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const reset = async () => {
  await connectDB();
  try {
    // Force delete any existing admin(s)
    const deleted = await User.deleteMany({ role: 'admin' });
    console.log(`🗑️  Deleted ${deleted.deletedCount} existing admin user(s)`);

    // Create fresh admin (pre-save hook will bcrypt the password)
    await User.create({
      name: 'System Admin',
      email: 'admin@school.com',
      username: 'admin',
      password: 'Admin@1234',
      role: 'admin',
    });

    console.log('✅ Admin reset successfully!');
    console.log('   Username : admin');
    console.log('   Password : Admin@1234');
    process.exit(0);
  } catch (err) {
    console.error('❌ Reset failed:', err.message);
    process.exit(1);
  }
};

reset();
