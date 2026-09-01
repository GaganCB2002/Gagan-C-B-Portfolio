import mongoose from 'mongoose'

const activityEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  sessionId: {
    type: String,
    default: ''
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      'AUTH_REGISTER', 'AUTH_LOGIN', 'AUTH_LOGOUT', 'AUTH_FAILURE',
      'PAGE_VIEW', 'PROFILE_VIEW', 'DASHBOARD_VIEW',
      'RECORD_CREATE', 'RECORD_UPDATE', 'RECORD_DELETE',
      'SEARCH', 'FEATURE_USED', 'BUTTON_CLICK',
      'FORM_SUBMIT', 'SESSION_START', 'SESSION_END',
      'VISIT', 'ERROR'
    ],
    index: true
  },
  eventName: {
    type: String,
    required: true
  },
  route: {
    type: String,
    default: ''
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  browser: {
    type: String,
    default: 'Unknown'
  },
  os: {
    type: String,
    default: 'Unknown'
  },
  device: {
    type: String,
    default: 'Unknown'
  },
  success: {
    type: Boolean,
    default: true
  },
  duration: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

activityEventSchema.index({ createdAt: -1 })
activityEventSchema.index({ userId: 1, createdAt: -1 })
activityEventSchema.index({ eventType: 1, createdAt: -1 })

export default mongoose.model('ActivityEvent', activityEventSchema)
