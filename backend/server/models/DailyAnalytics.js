import mongoose from 'mongoose'

const dailyAnalyticsSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  totalVisitors: {
    type: Number,
    default: 0
  },
  uniqueUsers: {
    type: Number,
    default: 0
  },
  activeUsers: {
    type: Number,
    default: 0
  },
  newUsers: {
    type: Number,
    default: 0
  },
  returningUsers: {
    type: Number,
    default: 0
  },
  sessions: {
    type: Number,
    default: 0
  },
  pageViews: {
    type: Number,
    default: 0
  },
  loginCount: {
    type: Number,
    default: 0
  },
  logoutCount: {
    type: Number,
    default: 0
  },
  registrationCount: {
    type: Number,
    default: 0
  },
  featureUsage: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  errorCount: {
    type: Number,
    default: 0
  },
  visitorIds: [{
    type: String
  }],
  userIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
})

dailyAnalyticsSchema.index({ date: 1 }, { unique: true })

export default mongoose.model('DailyAnalytics', dailyAnalyticsSchema)
