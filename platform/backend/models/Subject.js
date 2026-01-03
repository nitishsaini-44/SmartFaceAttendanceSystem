const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Subject code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  
  // Subject type
  type: {
    type: String,
    enum: ['theory', 'practical', 'both'],
    default: 'theory'
  },
  
  // Credits/marks info
  credits: { type: Number, default: 1 },
  maxMarks: { type: Number, default: 100 },
  passingMarks: { type: Number, default: 35 },
  
  // For which classes
  applicableClasses: [{
    type: String // e.g., "10", "11", "12"
  }],
  
  // Department
  department: {
    type: String,
    enum: ['science', 'commerce', 'arts', 'general'],
    default: 'general'
  },

  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

subjectSchema.index({ code: 1 });
subjectSchema.index({ name: 1, department: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
