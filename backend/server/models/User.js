import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    default: null,
    select: false
  },
  otpExpires: {
    type: Date,
    default: null,
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  totalVisits: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  this.otp = otp
  this.otpExpires = new Date(Date.now() + 10 * 60 * 1000)
  return otp
}

userSchema.methods.verifyOTP = function(candidateOTP) {
  if (!this.otp || !this.otpExpires) return false
  if (Date.now() > this.otpExpires.getTime()) return false
  return this.otp === candidateOTP
}

userSchema.methods.clearOTP = function() {
  this.otp = null
  this.otpExpires = null
}

userSchema.methods.toJSON = function() {
  const obj = this.toObject()
  delete obj.password
  delete obj.__v
  delete obj.otp
  delete obj.otpExpires
  return obj
}

export default mongoose.model('User', userSchema)
