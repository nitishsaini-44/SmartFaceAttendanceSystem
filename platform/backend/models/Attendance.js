const mongoose = require('mongoose');

// Individual attendance record for a student
const attendanceRecordSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused', 'half-day'],
    required: true
  },
  markedAt: { type: Date, default: Date.now },
  markedMethod: {
    type: String,
    enum: ['face-recognition', 'manual', 'qr-code'],
    default: 'manual'
  },
  confidenceScore: { type: Number, min: 0, max: 1 },
  arrivalTime: Date,
  remarks: String
});

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required']
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  session: {
    type: String,
    enum: ['morning', 'afternoon', 'full-day', 'period-1', 'period-2', 'period-3', 'period-4', 'period-5', 'period-6', 'period-7', 'period-8'],
    default: 'full-day'
  },
  records: [attendanceRecordSchema],
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  summary: {
    totalStudents: { type: Number, default: 0 },
    present: { type: Number, default: 0 },
    absent: { type: Number, default: 0 },
    late: { type: Number, default: 0 },
    excused: { type: Number, default: 0 }
  },
  isLocked: { type: Boolean, default: false },
  notes: String
}, {
  timestamps: true
});

// Indexes
attendanceSchema.index({ date: 1, class: 1, session: 1 }, { unique: true });
attendanceSchema.index({ date: 1, markedBy: 1 });
attendanceSchema.index({ 'records.student': 1, date: 1 });

// Pre-save: calculate summary
attendanceSchema.pre('save', function(next) {
  if (this.records && this.records.length > 0) {
    this.summary = {
      totalStudents: this.records.length,
      present: this.records.filter(r => r.status === 'present').length,
      absent: this.records.filter(r => r.status === 'absent').length,
      late: this.records.filter(r => r.status === 'late').length,
      excused: this.records.filter(r => r.status === 'excused').length
    };
  }
  next();
});

// Static: Get student attendance stats
attendanceSchema.statics.getStudentStats = async function(studentId, startDate, endDate) {
  const ObjectId = mongoose.Types.ObjectId;
  return await this.aggregate([
    {
      $match: {
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        'records.student': new ObjectId(studentId)
      }
    },
    { $unwind: '$records' },
    { $match: { 'records.student': new ObjectId(studentId) } },
    { $group: { _id: '$records.status', count: { $sum: 1 } } }
  ]);
};

// Static: Get class attendance for date range
attendanceSchema.statics.getClassStats = async function(classId, startDate, endDate) {
  const ObjectId = mongoose.Types.ObjectId;
  return await this.aggregate([
    {
      $match: {
        class: new ObjectId(classId),
        date: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }
    },
    {
      $group: {
        _id: null,
        totalDays: { $sum: 1 },
        avgPresent: { $avg: '$summary.present' },
        avgAbsent: { $avg: '$summary.absent' }
      }
    }
  ]);
};

module.exports = mongoose.model('Attendance', attendanceSchema);
