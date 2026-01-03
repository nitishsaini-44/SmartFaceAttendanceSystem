const mongoose = require('mongoose');

const lessonPlanSchema = new mongoose.Schema({
  // Basic info
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: String,
  
  // Target
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  chapter: String,
  topics: [String],
  
  // Lesson details
  duration: {
    type: Number, // in minutes
    default: 45
  },
  numberOfPeriods: {
    type: Number,
    default: 1
  },
  
  // Learning objectives
  objectives: [{
    type: String
  }],
  
  // Prerequisites
  prerequisites: [{
    type: String
  }],
  
  // Teaching methodology
  methodology: {
    type: String,
    enum: ['lecture', 'discussion', 'activity-based', 'project-based', 'flipped-classroom', 'blended'],
    default: 'lecture'
  },
  
  // Lesson structure
  structure: {
    introduction: {
      duration: Number,
      activities: [String],
      content: String
    },
    mainContent: {
      duration: Number,
      activities: [String],
      content: String,
      keyPoints: [String]
    },
    practice: {
      duration: Number,
      activities: [String],
      content: String
    },
    assessment: {
      duration: Number,
      activities: [String],
      content: String
    },
    conclusion: {
      duration: Number,
      activities: [String],
      content: String,
      homework: String
    }
  },
  
  // Resources needed
  resources: [{
    type: {
      type: String,
      enum: ['textbook', 'video', 'worksheet', 'presentation', 'online-tool', 'physical-material', 'other']
    },
    description: String,
    link: String
  }],
  
  // Linked resources from our system
  linkedResources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  }],
  
  // Differentiation strategies
  differentiation: {
    forAdvanced: [String],
    forStruggling: [String],
    forVisualLearners: [String],
    forKinestheticLearners: [String]
  },
  
  // Assessment questions/activities
  assessmentQuestions: [{
    question: String,
    type: { type: String, enum: ['oral', 'written', 'practical'] },
    expectedAnswer: String
  }],
  
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Source (if generated from PDF/resource)
  sourceResource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  },
  
  // AI generation info
  aiGeneration: {
    isAiGenerated: { type: Boolean, default: false },
    prompt: String,
    model: String,
    generatedAt: Date
  },
  
  // Schedule
  scheduledDate: Date,
  
  // Status and feedback
  status: {
    type: String,
    enum: ['draft', 'finalized', 'delivered', 'archived'],
    default: 'draft'
  },
  
  // Post-lesson reflection
  reflection: {
    completed: { type: Boolean, default: false },
    whatWorked: String,
    whatDidnt: String,
    improvements: String,
    studentEngagement: {
      type: String,
      enum: ['excellent', 'good', 'average', 'poor']
    },
    objectivesMet: { type: Boolean }
  },
  
  isActive: { type: Boolean, default: true }

}, {
  timestamps: true
});

// Indexes
lessonPlanSchema.index({ createdBy: 1, status: 1 });
lessonPlanSchema.index({ class: 1, subject: 1 });
lessonPlanSchema.index({ scheduledDate: 1 });
lessonPlanSchema.index({ title: 'text', topics: 'text' });

module.exports = mongoose.model('LessonPlan', lessonPlanSchema);
