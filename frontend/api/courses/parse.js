import { parsePlaylist } from '../../backend/services/youtubeParser.js';
import Course from '../../backend/models/Course.js';
import mongoose from 'mongoose';

const inMemoryCourses = new Map();

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

  try {
    const { playlistUrl, userId, clerkUserId } = req.body || {};
    const currentUserId = clerkUserId || userId || 'guest_user';

    if (!playlistUrl) {
      return res.status(400).json({ error: 'Playlist URL is required' });
    }

    const courseData = await parsePlaylist(playlistUrl);
    courseData.userId = currentUserId;
    courseData.clerkUserId = currentUserId;

    const MONGODB_URI = process.env.MONGODB_URI;
    if (MONGODB_URI && mongoose.connection.readyState === 0) {
      try {
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      } catch (e) {
        console.error('Mongo connection error:', e.message);
      }
    }

    try {
      let existingCourse = await Course.findOne({
        courseId: courseData.courseId,
        $or: [{ clerkUserId: currentUserId }, { userId: currentUserId }]
      });

      if (!existingCourse) {
        existingCourse = new Course(courseData);
        await existingCourse.save();
      }

      return res.status(200).json({ success: true, courseId: existingCourse.courseId, course: existingCourse });
    } catch (dbErr) {
      console.error('DB save fallback to memory:', dbErr.message);
      inMemoryCourses.set(`${currentUserId}:${courseData.courseId}`, courseData);
      return res.status(200).json({ success: true, courseId: courseData.courseId, course: courseData, note: 'Saved in memory' });
    }
  } catch (err) {
    console.error('Parse API error:', err.message);
    return res.status(400).json({ error: err.message || 'Failed to process playlist' });
  }
}
