import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  videoId: { type: String, required: true },
  duration: { type: String, default: '15:00' }
});

const moduleSchema = new mongoose.Schema({
  index: { type: String, required: true },
  title: { type: String, required: true },
  lessons: [lessonSchema]
});

const courseSchema = new mongoose.Schema({
  courseId: { type: String, required: true },
  userId: { type: String, default: 'guest_user' },
  clerkUserId: { type: String, default: 'guest_user' },
  title: { type: String, required: true },
  playlistUrl: { type: String, required: true },
  totalVideos: { type: Number, default: 0 },
  totalDuration: { type: String, default: '0h 0m' },
  modules: [moduleSchema],
  createdAt: { type: Date, default: Date.now }
});

courseSchema.index({ courseId: 1, clerkUserId: 1 });

export default mongoose.models.Course || mongoose.model('Course', courseSchema);
