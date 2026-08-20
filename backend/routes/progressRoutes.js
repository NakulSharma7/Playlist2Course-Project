import express from 'express';
import UserProgress from '../models/UserProgress.js';
import Course from '../models/Course.js';

const router = express.Router();

// Memory store for user progress if MongoDB is not connected
const inMemoryProgress = new Map();

// GET /api/progress/:courseId - Get user progress for course
router.get('/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.query.userId || 'guest_user';

    try {
      const [progress, course] = await Promise.all([
        UserProgress.findOne({ userId, courseId }),
        Course.findOne({ courseId })
      ]);

      if (progress) {
        const completedCount = progress.completedVideoIds?.length || 0;
        const total = course?.totalVideos || 1;
        const progressPercent = Math.round((completedCount / total) * 100);

        return res.json({
          completedVideoIds: progress.completedVideoIds || [],
          progressPercent,
          completedCount,
          totalVideos: total,
          lastWatchedVideoId: progress.lastWatchedVideoId || ''
        });
      }
    } catch (dbErr) {
      // DB connection fallback
    }

    const key = `${userId}:${courseId}`;
    if (inMemoryProgress.has(key)) {
      return res.json(inMemoryProgress.get(key));
    }

    return res.json({
      completedVideoIds: [],
      progressPercent: 0,
      completedCount: 0,
      totalVideos: 0,
      lastWatchedVideoId: ''
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
});

// POST /api/progress/toggle - Toggle lesson completion & dynamically calculate percentage: (completed / total * 100)
router.post('/toggle', async (req, res) => {
  try {
    const { userId = 'guest_user', courseId, videoId } = req.body;
    if (!courseId || !videoId) {
      return res.status(400).json({ error: 'courseId and videoId are required' });
    }

    // Fetch actual course to get accurate totalVideos
    let totalVideos = 1;
    try {
      const course = await Course.findOne({ courseId });
      if (course && course.totalVideos) {
        totalVideos = course.totalVideos;
      }
    } catch (err) {
      // Fallback if course lookup fails
      totalVideos = req.body.totalVideos || 1;
    }

    // Try MongoDB first
    try {
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
      // Dynamic Formula: (completedVideos / totalVideos) * 100
      progress.progressPercent = Math.round((completedCount / totalVideos) * 100);
      progress.lastWatchedVideoId = videoId;
      progress.updatedAt = new Date();
      await progress.save();

      return res.json({
        success: true,
        completedVideoIds: progress.completedVideoIds,
        progressPercent: progress.progressPercent,
        completedCount,
        totalVideos
      });
    } catch (dbErr) {
      // Memory fallback
      const key = `${userId}:${courseId}`;
      let data = inMemoryProgress.get(key) || { completedVideoIds: [], progressPercent: 0, lastWatchedVideoId: '' };
      
      const idx = data.completedVideoIds.indexOf(videoId);
      if (idx > -1) {
        data.completedVideoIds.splice(idx, 1);
      } else {
        data.completedVideoIds.push(videoId);
      }

      const completedCount = data.completedVideoIds.length;
      data.progressPercent = Math.round((completedCount / totalVideos) * 100);
      data.lastWatchedVideoId = videoId;

      inMemoryProgress.set(key, data);

      return res.json({
        success: true,
        completedVideoIds: data.completedVideoIds,
        progressPercent: data.progressPercent,
        completedCount,
        totalVideos
      });
    }
  } catch (err) {
    console.error('Error toggling progress:', err);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

export default router;
