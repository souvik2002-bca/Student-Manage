require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');

const USERNAME = 'admin';
const PASSWORD = 'Admin@1234';

const diag = async () => {
  await connectDB();
  console.log('\n🔍 Running login diagnostics...\n');

  // Step 1: Find user
  const user = await User.findOne({ username: USERNAME }).select('+password');
  if (!user) {
    console.log('❌ STEP 1 FAILED: No user found with username:', USERNAME);
    console.log('   → Run: node resetAdmin.js');
    return process.exit(1);
  }
  console.log('✅ STEP 1: User found');
  console.log('   Name    :', user.name);
  console.log('   Role    :', user.role);
  console.log('   Active  :', user.isActive);
  console.log('   Hash    :', user.password ? user.password.substring(0, 20) + '...' : 'MISSING!');

  // Step 2: Test password
  if (!user.password) {
    console.log('\n❌ STEP 2 FAILED: Password hash is missing from the DB document!');
    return process.exit(1);
  }
  const match = await bcrypt.compare(PASSWORD, user.password);
  if (!match) {
    console.log('\n❌ STEP 2 FAILED: Password does NOT match the stored hash');
    console.log('   → The hash in DB was created with a different password');
    console.log('   → Run: node resetAdmin.js  then try again');
    return process.exit(1);
  }
  console.log('✅ STEP 2: Password matches hash');

  // Step 3: Check isActive
  if (!user.isActive) {
    console.log('\n❌ STEP 3 FAILED: Account is disabled (isActive = false)');
    return process.exit(1);
  }
  console.log('✅ STEP 3: Account is active');

  console.log('\n🎉 All checks passed! Login should work with:');
  console.log('   Username:', USERNAME);
  console.log('   Password:', PASSWORD);
  process.exit(0);
};

diag().catch(err => {
  console.error('💥 Unexpected error:', err.message);
  process.exit(1);
});
