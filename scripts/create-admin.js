const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

// Check if MONGODB_URI is loaded
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  console.error('Make sure .env.local exists and contains MONGODB_URI');
  process.exit(1);
}

console.log('✅ Using MongoDB URI:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@')); // hide password

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define schema (use existing User model if available, else simple)
    const userSchema = new mongoose.Schema({
      email: String,
      mobileNumber: String,
      password: String,
      name: String,
      role: String,
    });
    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️ Admin already exists:', existingAdmin.email);
      console.log('To create another admin, change the email or delete the existing admin.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    const admin = await User.create({
      email: 'admin@edgetours.com',
      mobileNumber: '9999999999',
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
    });

    console.log('✅ Admin created successfully!');
    console.log('   Email:', admin.email);
    console.log('   Password: Admin@123');
    console.log('   Role: admin');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err);
    process.exit(1);
  }
}

createAdmin();