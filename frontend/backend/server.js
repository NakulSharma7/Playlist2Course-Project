import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import courseRoutes from './routes/courseRoutes.js';
import progressRoutes from './routes/progressRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI && mongoose.connection.readyState === 0) {
  mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('✅ Connected to MongoDB Database successfully!'))
    .catch((err) => console.error('⚠️ MongoDB Connection Warning:', err.message));
}

// Health Check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'OK', service: 'Playlist2Course Backend API', mongodbConnected: mongoose.connection.readyState === 1 });
});

// Routes mounted on both /api/ and root / for Vercel & Express compatibility
app.use('/api/courses', courseRoutes);
app.use('/courses', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/progress', progressRoutes);

export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Playlist2Course Backend Server running on http://localhost:${PORT}`);
  });
}
