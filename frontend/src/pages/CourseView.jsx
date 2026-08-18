import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

export default function CourseView() {
  const { id } = useParams();
  const { user, isLoaded, isSignedIn } = useUser();
  const userId = user?.id || 'guest_user';

  const [course, setCourse] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [completedVideoIds, setCompletedVideoIds] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [loading, setLoading] = useState(true);

  // Redirect signed out users to sign in page
  if (isLoaded && !isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  // Fetch course details & user progress
  useEffect(() => {
    async function fetchCourseData() {
      try {
        setLoading(true);
        // Fetch course structure from backend API
        const courseRes = await fetch(`http://localhost:5000/api/courses/${id || 'striver'}`);
        const courseData = await courseRes.json();
        setCourse(courseData);

        // Select first lesson by default
        if (courseData?.modules?.[0]?.lessons?.[0]) {
          setActiveVideo(courseData.modules[0].lessons[0]);
        }

        // Fetch user progress for this course (keyed by Clerk User ID or guest)
        const progressRes = await fetch(`http://localhost:5000/api/progress/${id || 'striver'}?userId=${userId}`);
        const progressData = await progressRes.json();

        setCompletedVideoIds(progressData.completedVideoIds || []);
        setProgressPercent(progressData.progressPercent || 0);
      } catch (err) {
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourseData();
  }, [id, userId]);

  // Toggle video lesson completion
  const handleToggleComplete = async (videoId, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch('http://localhost:5000/api/progress/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          courseId: id || 'striver',
          videoId,
          totalVideos: course?.totalVideos || 55
        })
      });

      const data = await res.json();
      if (data.success) {
        setCompletedVideoIds(data.completedVideoIds);
        setProgressPercent(data.progressPercent);
      }
    } catch (err) {
      console.error('Error toggling progress:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <p className="eyebrow">Loading CourseForge Path...</p>
      </div>
    );
  }

  const totalLessons = course?.totalVideos || 0;
  const completedCount = completedVideoIds.length;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main className="shell" style={{ flex: 1, padding: '40px 0 80px' }}>
        {/* Top Breadcrumb & Title */}
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <Link to="/" style={{ font: "500 .7rem 'DM Mono', monospace", color: 'var(--muted)', textTransform: 'uppercase' }}>
              ← Back to Home
            </Link>
            <h1 className="display" style={{ fontSize: 'clamp(2rem, 3.8vw, 3.5rem)', marginTop: '12px' }}>
              {course?.title || 'Structured Course'}<span className="dot">.</span>
            </h1>
          </div>
          {user && (
            <div style={{ font: "500 .75rem 'DM Mono', monospace", color: 'var(--accent)' }}>
              Logged in as {user.fullName || user.primaryEmailAddress?.emailAddress}
            </div>
          )}
        </div>

        {/* Course Header Bar with Progress Percentage */}
        <div
          style={{
            background: 'var(--ink)',
            color: 'var(--surface)',
            padding: '24px 30px',
            marginBottom: '40px',
            boxShadow: 'var(--shadow)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ font: "500 .65rem 'DM Mono', monospace", color: 'var(--mint)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
              Overall Progress
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  border: '1px solid var(--mint)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--mint)',
                  font: "500 .9rem 'DM Mono', monospace"
                }}
              >
                {progressPercent}%
              </div>
              <div style={{ flex: 1 }}>
                <div className="bar" style={{ height: '8px' }}>
                  <span style={{ width: `${progressPercent}%`, background: 'var(--mint)' }}></span>
                </div>
                <p style={{ margin: '8px 0 0', font: ".68rem 'DM Mono', monospace", color: 'oklch(0.97 0.009 88 / .65)' }}>
                  {completedCount} of {totalLessons} lessons completed
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', font: "500 .72rem 'DM Mono', monospace", justifyContent: 'flex-end' }}>
            <div>
              <div style={{ color: 'oklch(0.97 0.009 88 / .5)' }}>TOTAL LESSONS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--surface)' }}>{totalLessons} Videos</div>
            </div>
            <div>
              <div style={{ color: 'oklch(0.97 0.009 88 / .5)' }}>ESTIMATED TIME</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--mint)' }}>{course?.totalDuration || '48h 15m'}</div>
            </div>
          </div>
        </div>

        {/* Main Grid: Video Player + Module Lesson List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)', gap: '40px' }}>
          {/* Left Column: Embedded Player */}
          <div>
            <div style={{ background: '#000', aspectRatio: '16/9', boxShadow: '7px 7px 0 var(--ink)', overflow: 'hidden' }}>
              {activeVideo ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?autoplay=1`}
                  title={activeVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div style={{ color: '#fff', display: 'grid', placeItems: 'center', height: '100%' }}>
                  Select a video lesson to begin
                </div>
              )}
            </div>

            <div style={{ marginTop: '24px', padding: '20px', background: 'var(--surface)', border: '1px solid var(--ink)' }}>
              <p className="eyebrow">NOW PLAYING</p>
              <h2 style={{ fontSize: '1.3rem', margin: '8px 0 12px', fontWeight: 700 }}>{activeVideo?.title}</h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ font: ".75rem 'DM Mono', monospace", color: 'var(--muted)' }}>Duration: {activeVideo?.duration}</span>
                <button
                  className="button button-primary"
                  onClick={(e) => handleToggleComplete(activeVideo?.videoId, e)}
                  style={{ minHeight: '36px', fontSize: '.78rem' }}
                >
                  {completedVideoIds.includes(activeVideo?.videoId) ? '✓ Completed' : 'Mark as Complete'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Course Modules */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--ink)', padding: '24px', maxHeight: '720px', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '1.1rem', fontWeight: 700 }}>Course Modules</h3>

            {course?.modules?.map((moduleItem) => (
              <div key={moduleItem.index} style={{ marginBottom: '24px' }}>
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'var(--ink)',
                    color: 'var(--surface)',
                    font: "500 .75rem 'DM Mono', monospace",
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>
                    MODULE {moduleItem.index} — {moduleItem.title}
                  </span>
                  <span style={{ color: 'var(--mint)' }}>{moduleItem.lessons.length} Lessons</span>
                </div>

                <div style={{ border: '1px solid var(--line)', borderTop: 0 }}>
                  {moduleItem.lessons.map((lesson) => {
                    const isDone = completedVideoIds.includes(lesson.videoId);
                    const isActive = activeVideo?.videoId === lesson.videoId;

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => setActiveVideo(lesson)}
                        style={{
                          padding: '12px 14px',
                          display: 'grid',
                          gridTemplateColumns: '24px 1fr auto',
                          gap: '12px',
                          alignItems: 'center',
                          cursor: 'pointer',
                          background: isActive ? 'oklch(0.92 0.015 85)' : 'transparent',
                          borderBottom: '1px solid var(--line)'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={(e) => handleToggleComplete(lesson.videoId, e)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent)' }}
                        />
                        <span style={{ fontSize: '.84rem', fontWeight: isActive ? 700 : 500, textDecoration: isDone ? 'line-through' : 'none' }}>
                          {lesson.title}
                        </span>
                        <span style={{ font: ".65rem 'DM Mono', monospace", color: 'var(--muted)' }}>{lesson.duration}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
