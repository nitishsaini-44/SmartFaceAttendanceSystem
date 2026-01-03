const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Notification type
  type: {
    type: String,
    enum: [
      'attendance-marked',
      'attendance-absent',
      'quiz-assigned',
      'quiz-result',
      'performance-update',
      'resource-uploaded',
      'lesson-plan-shared',
      'announcement',
      'reminder',
      'system'
    ],
    required: true
  },
  
  // Content
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Related entity
  relatedTo: {
    model: {
      type: String,
      enum: ['Attendance', 'Quiz', 'Performance', 'Resource', 'LessonPlan', 'User', 'Class']
    },
    id: mongoose.Schema.Types.ObjectId
  },
  
  // Action URL (frontend route)
  actionUrl: String,
  
  // Sender (if applicable)
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  
  // For bulk notifications
  isBulk: {
    type: Boolean,
    default: false
  },
  bulkId: String, // To group related bulk notifications
  
  // Expiry
  expiresAt: Date

}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Static method to create bulk notifications
notificationSchema.statics.createBulk = async function(recipients, notificationData) {
  const bulkId = new mongoose.Types.ObjectId().toString();
  const notifications = recipients.map(recipientId => ({
    ...notificationData,
    recipient: recipientId,
    isBulk: true,
    bulkId
  }));
  return await this.insertMany(notifications);
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ recipient: userId, isRead: false });
};

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  await this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);
