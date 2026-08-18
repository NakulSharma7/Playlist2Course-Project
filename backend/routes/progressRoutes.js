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
      const progress = await UserProgress.findOne({ userId, courseId });
      if (progress) {
        return res.json({
          completedVideoIds: progress.completedVideoIds,
          progressPercent: progress.progressPercent,
          lastWatchedVideoId: progress.lastWatchedVideoId
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
      lastWatchedVideoId: ''
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
});

// POST /api/progress/toggle - Toggle lesson completion & recalculate percentage
router.post('/toggle', async (req, res) => {
  try {
    const { userId = 'guest_user', courseId, videoId, totalVideos = 55 } = req.body;
    if (!courseId || !videoId) {
      return res.status(400).json({ error: 'courseId and videoId are required' });
    }

    let completedVideoIds = [];
    let progressPercent = 0;

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

      progress.lastWatchedVideoId = videoId;
      progress.progressPercent = Math.round((progress.completedVideoIds.length / totalVideos) * 100);
      progress.updatedAt = new Date();
      await progress.save();

      return res.json({
        success: true,
        completedVideoIds: progress.completedVideoIds,
        progressPercent: progress.progressPercent,
        totalCompleted: progress.completedVideoIds.length,
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

      data.lastWatchedVideoId = videoId;
      data.progressPercent = Math.round((data.completedVideoIds.length / totalVideos) * 100);

      inMemoryProgress.set(key, data);

      return res.json({
        success: true,
        completedVideoIds: data.completedVideoIds,
        progressPercent: data.progressPercent,
        totalCompleted: data.completedVideoIds.length,
        totalVideos
      });
    }
  } catch (err) {
    console.error('Error toggling progress:', err);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

export default router;
