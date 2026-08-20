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

  const { id } = req.query;
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
    let course;
    if (currentUserId) {
      course = await Course.findOne({
        courseId: id,
        $or: [{ clerkUserId: currentUserId }, { userId: currentUserId }]
      });
    }
    if (!course) {
      course = await Course.findOne({ courseId: id });
    }

    if (course) {
      return res.status(200).json(course);
    }

    return res.status(404).json({ error: 'Course not found' });
  } catch (err) {
    console.error('Fetch course error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch course' });
  }
}
