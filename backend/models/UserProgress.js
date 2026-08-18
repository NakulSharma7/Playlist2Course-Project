import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  courseId: { type: String, required: true },
  completedVideoIds: [{ type: String }],
  progressPercent: { type: Number, default: 0 },
  lastWatchedVideoId: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

userProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model('UserProgress', userProgressSchema);
