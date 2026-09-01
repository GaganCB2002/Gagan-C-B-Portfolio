const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gagan-portfolio';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[DB] MongoDB connected successfully');
  } catch (error) {
    console.error('[DB] MongoDB connection error:', error.message);
    process.exit(1);
  }
}

module.exports = { connectDB, MONGODB_URI };
