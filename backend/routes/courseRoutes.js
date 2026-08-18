import express from 'express';
import Course from '../models/Course.js';
import { parsePlaylist } from '../services/youtubeParser.js';

const router = express.Router();

// Memory store fallback if MongoDB is not connected yet
const inMemoryCourses = new Map();

// POST /api/courses/parse - Parse YouTube playlist URL dynamically and save course
router.post('/parse', async (req, res) => {
  try {
    const { playlistUrl } = req.body;
    if (!playlistUrl) {
      return res.status(400).json({ error: 'Playlist URL is required' });
    }

    const courseData = await parsePlaylist(playlistUrl);
    
    // Save to MongoDB if connected
    try {
      let existingCourse = await Course.findOne({ courseId: courseData.courseId });
      if (!existingCourse) {
        existingCourse = new Course(courseData);
        await existingCourse.save();
      }
      return res.json({ success: true, courseId: existingCourse.courseId, course: existingCourse });
    } catch (dbErr) {
      // Memory fallback
      inMemoryCourses.set(courseData.courseId, courseData);
      return res.json({ success: true, courseId: courseData.courseId, course: courseData, note: 'Saved in memory mode' });
    }
  } catch (err) {
    console.error('Error parsing playlist:', err.message);
    res.status(400).json({ error: err.message || 'Failed to process playlist' });
  }
});

// GET /api/courses - List all courses created by users
router.get('/', async (req, res) => {
  try {
    let coursesList = [];
    try {
      coursesList = await Course.find({}).lean();
    } catch (dbErr) {
      // Memory fallback
    }

    if (!coursesList || coursesList.length === 0) {
      coursesList = Array.from(inMemoryCourses.values());
    }

    res.json(coursesList);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// GET /api/courses/:id - Get specific course details
router.get('/:id', async (req, res) => {
  try {
    const courseId = req.params.id;
    try {
      const course = await Course.findOne({ courseId });
      if (course) return res.json(course);
    } catch (dbErr) {
      // Memory fallback check
    }

    if (inMemoryCourses.has(courseId)) {
      return res.json(inMemoryCourses.get(courseId));
    }

    return res.status(404).json({ error: 'Course not found. Please paste the playlist URL on the dashboard to generate it.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

export default router;
