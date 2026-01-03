const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    uppercase: true,
    trim: true
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY']
  },
  
  // Class teacher
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Subject teachers mapping
  subjectTeachers: [{
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  // Class schedule
  schedule: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    },
    periods: [{
      periodNumber: Number,
      startTime: String,
      endTime: String,
      subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
      teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
  }],

  // Room info
  roomNumber: String,
  building: String,
  
  // Capacity
  maxStrength: { type: Number, default: 50 },
  
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for getting students count
classSchema.virtual('students', {
  ref: 'User',
  localField: '_id',
  foreignField: 'studentInfo.class',
  count: true
});

// Compound unique index
classSchema.index({ name: 1, section: 1, academicYear: 1 }, { unique: true });

// Virtual for display name
classSchema.virtual('displayName').get(function() {
  return `${this.name} - ${this.section}`;
});

module.exports = mongoose.model('Class', classSchema);
