import UserProgress from '../../backend/models/UserProgress.js';
import Course from '../../backend/models/Course.js';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userId = 'guest_user', courseId, videoId } = req.body || {};
  if (!courseId || !videoId) {
    return res.status(400).json({ error: 'courseId and videoId are required' });
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (MONGODB_URI && mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    } catch (e) {
      console.error('Mongo connection error:', e.message);
    }
  }

  try {
    let totalVideos = 1;
    try {
      const course = await Course.findOne({ courseId });
      if (course && course.totalVideos) {
        totalVideos = course.totalVideos;
      }
    } catch (err) {
      totalVideos = req.body.totalVideos || 1;
    }

    let progress = await UserProgress.findOne({ userId, courseId });
    if (!progress) {
      progress = new UserProgress({ userId, courseId, completedVideoIds: [] });
    }

    const index = progress.completedVideoIds.indexOf(videoId);
    if (index > -1) {
      progress.completedVideoIds.splice(index, 1);
    } else {
      progress.completedVideoIds.push(videoId);
    }

    const completedCount = progress.completedVideoIds.length;
    progress.progressPercent = Math.round((completedCount / totalVideos) * 100);
    progress.lastWatchedVideoId = videoId;
    progress.updatedAt = new Date();
    await progress.save();

    return res.status(200).json({
      success: true,
      completedVideoIds: progress.completedVideoIds,
      progressPercent: progress.progressPercent,
      completedCount,
      totalVideos
    });
  } catch (err) {
    console.error('Toggle progress error:', err);
    return res.status(500).json({ error: 'Failed to update progress' });
  }
}
