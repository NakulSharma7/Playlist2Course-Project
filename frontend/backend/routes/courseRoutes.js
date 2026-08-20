import express from 'express';
import Course from '../models/Course.js';
import UserProgress from '../models/UserProgress.js';
import { parsePlaylist } from '../services/youtubeParser.js';

const router = express.Router();

// Memory store fallback if MongoDB is not connected yet
const inMemoryCourses = new Map();

// POST /api/courses/parse - Parse YouTube playlist URL dynamically and save course
router.post('/parse', async (req, res) => {
  try {
    const { playlistUrl, userId, clerkUserId } = req.body;
    const currentUserId = clerkUserId || userId || 'guest_user';

    if (!playlistUrl) {
      return res.status(400).json({ error: 'Playlist URL is required' });
    }

    const courseData = await parsePlaylist(playlistUrl);
    courseData.userId = currentUserId;
    courseData.clerkUserId = currentUserId;

    // Save to MongoDB Atlas if connected
    try {
      let existingCourse = await Course.findOne({
        courseId: courseData.courseId,
        $or: [{ clerkUserId: currentUserId }, { userId: currentUserId }]
      });

      if (!existingCourse) {
        existingCourse = new Course(courseData);
        await existingCourse.save();
      }

      return res.json({ success: true, courseId: existingCourse.courseId, course: existingCourse });
    } catch (dbErr) {
      console.error('Database save error:', dbErr.message);
      inMemoryCourses.set(`${currentUserId}:${courseData.courseId}`, courseData);
      return res.json({ success: true, courseId: courseData.courseId, course: courseData, note: 'Saved in memory mode' });
    }
  } catch (err) {
    console.error('Error parsing playlist:', err.message);
    res.status(400).json({ error: err.message || 'Failed to process playlist' });
  }
});

// GET /api/courses - List courses created by logged-in user (where clerkUserId = logged-in user)
router.get('/', async (req, res) => {
  try {
    const currentUserId = req.query.clerkUserId || req.query.userId;
    let coursesList = [];

    try {
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
    } catch (dbErr) {
      console.error('Database fetch error:', dbErr.message);
    }

    if ((!coursesList || coursesList.length === 0) && currentUserId) {
      coursesList = Array.from(inMemoryCourses.values()).filter(c => c.clerkUserId === currentUserId || c.userId === currentUserId);
    } else if (!coursesList || coursesList.length === 0) {
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
    const currentUserId = req.query.clerkUserId || req.query.userId;

    try {
      let course;
      if (currentUserId) {
        course = await Course.findOne({
          courseId,
          $or: [{ clerkUserId: currentUserId }, { userId: currentUserId }]
        });
      }
      if (!course) {
        course = await Course.findOne({ courseId });
      }
      if (course) return res.json(course);
    } catch (dbErr) {
      console.error('DB fetch error:', dbErr.message);
    }

    if (currentUserId && inMemoryCourses.has(`${currentUserId}:${courseId}`)) {
      return res.json(inMemoryCourses.get(`${currentUserId}:${courseId}`));
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
