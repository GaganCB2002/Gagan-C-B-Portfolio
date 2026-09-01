const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gagan-portfolio';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  otp: { type: String, default: null },
  otpExpires: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: null },
  lastActive: { type: Date, default: Date.now },
  totalSessions: { type: Number, default: 0 },
  totalVisits: { type: Number, default: 0 }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[SEED] Connected to MongoDB');

    const adminEmail = 'gagancb2002@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Gagan@2002@2026', 12);
      const admin = new User({
        name: 'Gagan C B',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        isActive: true
      });
      await admin.save();
      console.log('[SEED] Admin user created:', adminEmail);
    } else {
      console.log('[SEED] Admin user already exists:', adminEmail);
    }

    console.log('[SEED] Seeding complete');
    process.exit(0);
  } catch (error) {
    console.error('[SEED] Error:', error);
    process.exit(1);
  }
}

seed();
