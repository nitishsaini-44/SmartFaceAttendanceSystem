const mongoose = require('mongoose');

// Individual message in conversation
const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // For voice queries
  isVoiceInput: {
    type: Boolean,
    default: false
  },
  // Audio transcript confidence (if voice)
  transcriptConfidence: Number,
  // Metadata about the response
  metadata: {
    tokensUsed: Number,
    model: String,
    responseTime: Number, // ms
    // If the response included data queries
    dataQueried: {
      type: { type: String }, // 'attendance', 'performance', 'student'
      filters: mongoose.Schema.Types.Mixed
    }
  }
});

const aiConversationSchema = new mongoose.Schema({
  // User who initiated
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Conversation type
  type: {
    type: String,
    enum: ['general', 'attendance-query', 'performance-query', 'quiz-generation', 'lesson-plan', 'student-help'],
    default: 'general'
  },
  
  // Context (class/subject if relevant)
  context: {
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // If query is about specific student
  },
  
  // Conversation title (auto-generated or user-set)
  title: {
    type: String,
    default: 'New Conversation'
  },
  
  // All messages
  messages: [messageSchema],
  
  // System prompt used
  systemPrompt: {
    type: String,
    select: false
  },
  
  // Summary (for long conversations)
  summary: String,
  
  // Stats
  stats: {
    totalMessages: { type: Number, default: 0 },
    totalTokensUsed: { type: Number, default: 0 },
    voiceQueries: { type: Number, default: 0 }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Last activity
  lastActivity: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true
});

// Indexes
aiConversationSchema.index({ user: 1, lastActivity: -1 });
aiConversationSchema.index({ user: 1, type: 1 });
aiConversationSchema.index({ 'context.class': 1 });

// Update stats on message add
aiConversationSchema.methods.addMessage = function(messageData) {
  this.messages.push(messageData);
  this.stats.totalMessages = this.messages.length;
  if (messageData.isVoiceInput) {
    this.stats.voiceQueries += 1;
  }
  if (messageData.metadata?.tokensUsed) {
    this.stats.totalTokensUsed += messageData.metadata.tokensUsed;
  }
  this.lastActivity = new Date();
};

// Auto-generate title from first user message
aiConversationSchema.pre('save', function(next) {
  if (this.isNew && this.messages.length > 0) {
    const firstUserMsg = this.messages.find(m => m.role === 'user');
    if (firstUserMsg) {
      this.title = firstUserMsg.content.substring(0, 50) + (firstUserMsg.content.length > 50 ? '...' : '');
    }
  }
  next();
});

module.exports = mongoose.model('AIConversation', aiConversationSchema);
