const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: { type: String, maxlength: 1000 },
  type: {
    type: String,
    enum: ['pdf', 'document', 'video', 'link', 'lesson-plan', 'syllabus', 'notes', 'presentation', 'curriculum'],
    required: true
  },
  file: {
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimeType: String,
    url: String
  },
  externalUrl: String,
  extractedText: { type: String, select: false },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  applicableClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  topics: [{ type: String, trim: true }],
  chapter: String,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  aiGeneratedContent: {
    summary: String,
    keyPoints: [String],
    questionsGenerated: { type: Number, default: 0 },
    lessonPlansGenerated: { type: Number, default: 0 },
    lastProcessed: Date
  },
  visibility: {
    type: String,
    enum: ['public', 'class-specific', 'private'],
    default: 'class-specific'
  },
  downloadCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isProcessed: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Indexes
resourceSchema.index({ uploadedBy: 1, createdAt: -1 });
resourceSchema.index({ subject: 1, type: 1 });
resourceSchema.index({ applicableClasses: 1 });
resourceSchema.index({ title: 'text', description: 'text', topics: 'text' });

// Virtual for file URL
resourceSchema.virtual('fileUrl').get(function() {
  if (this.file && this.file.path) return `/uploads/${this.file.filename}`;
  return this.externalUrl;
});

// Increment view
resourceSchema.methods.incrementView = async function() {
  this.viewCount += 1;
  await this.save();
};

// Increment download
resourceSchema.methods.incrementDownload = async function() {
  this.downloadCount += 1;
  await this.save();
};

module.exports = mongoose.model('Resource', resourceSchema);
