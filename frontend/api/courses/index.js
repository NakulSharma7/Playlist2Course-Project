import Course from '../../backend/models/Course.js';
import UserProgress from '../../backend/models/UserProgress.js';
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

  const currentUserId = req.query.clerkUserId || req.query.userId;

  const MONGODB_URI = process.env.MONGODB_URI;
  if (MONGODB_URI && mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    } catch (e) {
      console.error('Mongo connection error:', e.message);
    }
  }

  try {
    let coursesList = [];
    if (currentUserId) {
      coursesList = await Course.find({
        $or: [{ clerkUserId: currentUserId }, { userId: currentUserId }]
      }).lean();
    } else {
      coursesList = await Course.find({}).lean();
    }

    if (currentUserId && coursesList.length > 0) {
      const userProgresses = await UserProgress.find({ userId: currentUserId }).lean();
      const progressMap = new Map(userProgresses.map(p => [p.courseId, p]));

      coursesList = coursesList.map(course => {
        const p = progressMap.get(course.courseId);
        const completedCount = p?.completedVideoIds?.length || 0;
        const total = course.totalVideos || 1;
        const progressPercent = p?.progressPercent ?? Math.round((completedCount / total) * 100);

        return {
          ...course,
          progressPercent,
          completedCount,
          completedVideoIds: p?.completedVideoIds || [],
          lastWatchedVideoId: p?.lastWatchedVideoId || ''
        };
      });
    }

    return res.status(200).json(coursesList || []);
  } catch (err) {
    console.error('Fetch courses error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch courses' });
  }
}
