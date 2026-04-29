require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const connectDB = require('./config/db');

const seed = async () => {
  await connectDB();

  try {
    // Seed Admin
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@school.com',
        username: 'admin',
        password: 'Admin@1234',
        role: 'admin',
      });
      console.log('✅ Admin user created (username: admin, password: Admin@1234)');
    }

    // Seed Course
    const courseExists = await Course.findOne({ code: 'CS101' });
    if (!courseExists) {
      await Course.create({
        name: 'Computer Science & Engineering',
        code: 'CS101',
        duration: '4 Years',
        fee: 50000
      });
      console.log('✅ Default Course created');
    }

    console.log('🌱 Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error with seeding data', error);
    process.exit(1);
  }
};

seed();
