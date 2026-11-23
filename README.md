# 🎓 Playlist2Course

**Turn any YouTube playlist into a structured learning experience.**

Playlist2Course is a full-stack educational web application that transforms YouTube playlists into organized courses with modules, lessons, video playback, automatic lesson completion, and progress tracking.

## 🚀 Problem Statement

YouTube is a great platform for learning, but studying through long playlists can be distracting.

- Too many recommendations and distractions.
- Difficult to keep track of completed videos.
- No proper course-like structure.
- No built-in learning progress tracking for a playlist.

**Our Solution:** Playlist2Course provides a focused, course-like learning experience by organizing YouTube playlist videos into modules and lessons.

## ✨ Features

- **Playlist to Course Conversion:** Paste a public YouTube playlist URL to generate a course.
- **Automatic Module Generation:** Videos are automatically grouped into modules, with 6 lessons per module.
- **YouTube Video Integration:** Watch lessons directly inside the application.
- **Auto-Next Lesson:** Automatically moves to the next lesson when the current video finishes.
- **Progress Tracking:** Track completed lessons and overall course completion percentage.
- **User Authentication:** Sign up and sign in using Clerk.
- **Cloud Database:** Store course information and user progress in MongoDB Atlas.
- **Responsive UI:** Clean interface for navigating courses and lessons.
- **Fallback Support:** In-memory storage fallback when MongoDB operations fail.

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Frontend | React 19, Vite 8 |
| Routing | React Router v7 |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | Clerk |
| External API | YouTube Data API v3 |
| Video Player | YouTube IFrame API |
| Styling | Vanilla CSS |
| Icons | Lucide React |
| Deployment | Vercel |

## 🏗️ Project Architecture

The application follows a client-server architecture.

```text
                 USER
                   |
                   v
            REACT FRONTEND
                   |
            CLERK AUTHENTICATION
                   |
                   v
          NODE.JS + EXPRESS API
                   |
          YOUTUBE DATA API v3
                   |
          FETCH PLAYLIST DATA
                   |
          COURSE GENERATION
                   |
          GROUP VIDEOS INTO
          MODULES AND LESSONS
                   |
                   v
              MONGODB
                   |
                   v
          STRUCTURED COURSE
                   |
                   v
           COURSE PLAYER
                   |
           YOUTUBE IFRAME API
                   |
          VIDEO COMPLETED
                   |
          AUTO-NEXT LESSON
                   |
          UPDATE USER PROGRESS
                   |
                   v
              MONGODB
```

## ⚙️ How It Works

**1. User Authentication**

Users sign in through Clerk before accessing their courses.

**2. Playlist Submission**

The user pastes a public YouTube playlist URL into the application.

**3. Playlist Processing**

The backend extracts the playlist ID and communicates with YouTube Data API v3 to retrieve playlist details, video IDs, titles, thumbnails, and durations.

**4. Course Generation**

The backend processes the retrieved videos and groups them into modules containing 6 lessons each.

**5. Database Storage**

The generated course information is stored in MongoDB Atlas.

**6. Video Learning**

Users can watch videos through the embedded YouTube player and navigate between lessons.

**7. Automatic Progress Tracking**

When a video finishes, the YouTube IFrame API detects the completion event. The application marks the lesson as completed and moves to the next lesson.

**8. Progress Synchronization**

The application updates the progress percentage immediately in the frontend and synchronizes the change with the backend.

## 📂 Project Structure

```text
Playlist2Course-Project/
│
├── api/
│   └── index.js
│
├── backend/
│   ├── models/
│   │   ├── Course.js
│   │   └── UserProgress.js
│   │
│   ├── routes/
│   │   ├── courseRoutes.js
│   │   └── progressRoutes.js
│   │
│   ├── services/
│   │   └── youtubeParser.js
│   │
│   └── server.js
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── config.js
│
└── vercel.json
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/courses/parse` | Parse playlist and generate a course |
| GET | `/api/courses` | Fetch available courses |
| GET | `/api/courses/:id` | Fetch course details |
| GET | `/api/progress/:courseId` | Fetch user progress |
| POST | `/api/progress/toggle` | Toggle lesson completion |

## 🗄️ Database Models

**1. Course Model**

Stores course information, including:

- Course ID
- User ID
- Course title
- Playlist URL
- Total videos
- Modules and lessons
- Creation date

**2. UserProgress Model**

Stores individual learning progress:

- User ID
- Course ID
- Completed video IDs
- Progress percentage
- Last watched video ID
- Updated date

A compound unique index on `userId` and `courseId` ensures one progress record per user-course combination.

## 💻 Installation and Setup

**Prerequisites**

- Node.js
- npm
- MongoDB Atlas account
- YouTube Data API v3 key
- Clerk account

**1. Clone the repository**

```bash
git clone https://github.com/NakulSharma7/Playlist2Course-Project.git

cd Playlist2Course-Project
```

**2. Backend Setup**

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory and configure the required environment variables:

```env
PORT=5000
YOUTUBE_API_KEY=your_youtube_api_key
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
```

Use the exact MongoDB and Clerk variable names expected by your backend configuration.

**3. Frontend Setup**

```bash
cd frontend
npm install
```

Configure your frontend environment variables:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE_URL=http://localhost:5000/api
```

**4. Run the Application**

Start the backend and frontend using their respective development scripts.

```bash
npm run dev
```

Check the `package.json` scripts in each directory if the development command differs.

## ☁️ Deployment

The project is deployed using Vercel.

The deployment supports:

- React frontend hosting.
- Express backend through Vercel serverless functions.
- API routing through `vercel.json`.
- Relative `/api` configuration in production.

## 🔮 Future Improvements

- AI-generated course summaries.
- AI-generated quizzes for each module.
- Video bookmarking and timestamp-based notes.
- Redis caching for frequently accessed courses.
- More personalized learning recommendations.

## 👨‍💻 Author

**Nakul Sharma**

Full-Stack Developer | Java | React | Node.js

GitHub: https://github.com/NakulSharma7

---

⭐ If you find this project useful, consider giving it a star!
