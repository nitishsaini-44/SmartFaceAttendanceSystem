const mongoose = require('mongoose');

// Individual assessment result
const assessmentResultSchema = new mongoose.Schema({
  assessmentType: {
    type: String,
    enum: ['quiz', 'assignment', 'unit-test', 'mid-term', 'final-exam', 'practical', 'project', 'viva'],
    required: true
  },
  title: { type: String, required: true },
  maxMarks: { type: Number, required: true },
  obtainedMarks: { type: Number, required: true, min: 0 },
  percentage: Number,
  grade: { type: String, enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', 'NA'] },
  date: { type: Date, default: Date.now },
  feedback: String,
  aiGenerated: { type: Boolean, default: false },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }
});

const performanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required']
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required']
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required']
  },
  term: {
    type: String,
    enum: ['term-1', 'term-2', 'term-3', 'semester-1', 'semester-2', 'annual'],
    required: true
  },
  assessments: [assessmentResultSchema],
  aggregateScore: {
    totalMaxMarks: { type: Number, default: 0 },
    totalObtainedMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    grade: { type: String, enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', 'NA'], default: 'NA' },
    rank: Number
  },
  teacherRemarks: {
    comment: String,
    strengths: [String],
    improvements: [String],
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: Date
  },
  attendancePercentage: { type: Number, min: 0, max: 100 },
  trend: {
    type: String,
    enum: ['improving', 'stable', 'declining', 'na'],
    default: 'na'
  }
}, {
  timestamps: true
});

// Indexes
performanceSchema.index({ student: 1, academicYear: 1, term: 1 });
performanceSchema.index({ class: 1, subject: 1, academicYear: 1 });

// Helper function
function calculateGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  if (percentage >= 33) return 'D';
  return 'F';
}

// Method to add assessment
performanceSchema.methods.addAssessment = function(data) {
  data.percentage = Math.round((data.obtainedMarks / data.maxMarks) * 100);
  data.grade = calculateGrade(data.percentage);
  this.assessments.push(data);
  this.recalculateAggregate();
};

// Method to recalculate aggregate
performanceSchema.methods.recalculateAggregate = function() {
  if (this.assessments.length === 0) {
    this.aggregateScore = { totalMaxMarks: 0, totalObtainedMarks: 0, percentage: 0, grade: 'NA' };
    return;
  }
  const totalMax = this.assessments.reduce((sum, a) => sum + a.maxMarks, 0);
  const totalObtained = this.assessments.reduce((sum, a) => sum + a.obtainedMarks, 0);
  const percentage = Math.round((totalObtained / totalMax) * 100);
  this.aggregateScore = {
    totalMaxMarks: totalMax,
    totalObtainedMarks: totalObtained,
    percentage,
    grade: calculateGrade(percentage)
  };
};

// Static: Get student overview
performanceSchema.statics.getStudentOverview = async function(studentId, academicYear) {
  const ObjectId = mongoose.Types.ObjectId;
  return await this.aggregate([
    { $match: { student: new ObjectId(studentId), academicYear } },
    { $lookup: { from: 'subjects', localField: 'subject', foreignField: '_id', as: 'subjectDetails' } },
    { $unwind: '$subjectDetails' },
    {
      $project: {
        subject: '$subjectDetails.name',
        percentage: '$aggregateScore.percentage',
        grade: '$aggregateScore.grade',
        assessmentCount: { $size: '$assessments' },
        trend: 1
      }
    }
  ]);
};

module.exports = mongoose.model('Performance', performanceSchema);
