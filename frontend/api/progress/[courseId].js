import UserProgress from '../../backend/models/UserProgress.js';
import Course from '../../backend/models/Course.js';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { courseId } = req.query;
  const userId = req.query.userId || 'guest_user';

  const MONGODB_URI = process.env.MONGODB_URI;
  if (MONGODB_URI && mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    } catch (e) {
      console.error('Mongo connection error:', e.message);
    }
  }

  try {
    const [progress, course] = await Promise.all([
      UserProgress.findOne({ userId, courseId }),
      Course.findOne({ courseId })
    ]);

    if (progress) {
      const completedCount = progress.completedVideoIds?.length || 0;
      const total = course?.totalVideos || 1;
      const progressPercent = Math.round((completedCount / total) * 100);

      return res.status(200).json({
        completedVideoIds: progress.completedVideoIds || [],
        progressPercent,
        completedCount,
        totalVideos: total,
        lastWatchedVideoId: progress.lastWatchedVideoId || ''
      });
    }

    return res.status(200).json({
      completedVideoIds: [],
      progressPercent: 0,
      completedCount: 0,
      totalVideos: course?.totalVideos || 0,
      lastWatchedVideoId: ''
    });
  } catch (err) {
    console.error('Fetch progress error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch user progress' });
  }
}
