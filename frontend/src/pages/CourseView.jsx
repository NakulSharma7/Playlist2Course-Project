import { useState, useEffect, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { API_BASE_URL } from '../config.js';

export default function CourseView() {
  const { id } = useParams();
  const { user, isLoaded, isSignedIn } = useUser();
  const userId = user?.id || 'guest_user';

  const [course, setCourse] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [completedVideoIds, setCompletedVideoIds] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [loading, setLoading] = useState(true);

  const playerRef = useRef(null);

  // Redirect signed out users to sign in page
  if (isLoaded && !isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  // Fetch course details & user progress
  useEffect(() => {
    async function fetchCourseData() {
      try {
        setLoading(true);
        const courseRes = await fetch(`${API_BASE_URL}/courses/${id || 'striver'}?clerkUserId=${userId}&userId=${userId}`);
        const courseData = await courseRes.json();
        setCourse(courseData);

        if (courseData?.modules?.[0]?.lessons?.[0]) {
          setActiveVideo(courseData.modules[0].lessons[0]);
        }

        const progressRes = await fetch(`${API_BASE_URL}/progress/${id || 'striver'}?userId=${userId}`);
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

  // Toggle video lesson completion optimistically (0ms latency, zero lag)
  const handleToggleComplete = (videoId, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    setCompletedVideoIds((prev) => {
      const isCompleted = prev.includes(videoId);
      const updated = isCompleted
        ? prev.filter((vId) => vId !== videoId)
        : [...prev, videoId];

      const total = course?.totalVideos || 1;
      const newPercent = Math.round((updated.length / total) * 100);
      setProgressPercent(newPercent);

      return updated;
    });

    // Background sync to backend
    fetch(`${API_BASE_URL}/progress/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        courseId: id || 'striver',
        videoId,
        totalVideos: course?.totalVideos || 1,
      }),
    }).catch((err) => console.error('Background progress sync error:', err));
  };

  // Helper to advance to next video when current video ends
  const playNextVideo = () => {
    if (!course?.modules || !activeVideo) return;
    const allLessons = course.modules.flatMap((m) => m.lessons);
    const currentIndex = allLessons.findIndex((l) => l.videoId === activeVideo.videoId);

    // 1. Mark current video as completed automatically
    handleToggleComplete(activeVideo.videoId);

    // 2. Advance to next video if available
    if (currentIndex > -1 && currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      setActiveVideo(nextLesson);
    }
  };

  // Initialize YouTube IFrame API to listen for ENDED state (State 0)
  useEffect(() => {
    if (!activeVideo?.videoId) return;

    // Load YT IFrame API Script if not loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    let ytPlayer = null;

    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
        try {
          ytPlayer = new window.YT.Player('yt-player-iframe', {
            events: {
              onStateChange: (event) => {
                // 0 = window.YT.PlayerState.ENDED
                if (event.data === 0) {
                  console.log('🎬 Video finished! Marking complete & advancing to next video...');
                  playNextVideo();
                }
              },
            },
          });
          playerRef.current = ytPlayer;
        } catch (err) {
          console.warn('YT player init notice:', err);
        }
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (ytPlayer && ytPlayer.destroy) {
        try {
          ytPlayer.destroy();
        } catch (e) {}
      }
    };
  }, [activeVideo?.videoId]);

  if (loading) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <p className="eyebrow">Loading Playlist2Course Path...</p>
      </div>
    );
  }

  const totalLessons = course?.totalVideos || 0;
  const completedCount = completedVideoIds.length;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header hideNavLinks />

      <main className="shell" style={{ flex: 1, padding: '40px 0 80px' }}>
        {/* Top Breadcrumb & Title */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <Link to="/dashboard" style={{ font: "500 .7rem 'DM Mono', monospace", color: 'var(--muted)', textTransform: 'uppercase' }}>
              ← Back to Courses
            </Link>
            <h1 className="display" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', marginTop: '8px', margin: 0 }}>
              {course?.title || 'Structured Course'}<span className="dot">.</span>
            </h1>
          </div>
          {user && (
            <div style={{ font: "500 .75rem 'DM Mono', monospace", color: 'var(--accent)' }}>
              Logged in as {user.fullName || user.primaryEmailAddress?.emailAddress}
            </div>
          )}
        </div>

        {/* Course Progress Card */}
        <div style={{ marginBottom: '32px', background: 'var(--surface)', padding: '20px 24px', border: '1px solid var(--ink)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ font: "600 .85rem 'DM Mono', monospace" }}>Overall Course Completion</span>
            <span style={{ font: "700 .95rem 'DM Mono', monospace", color: 'var(--accent)' }}>
              {progressPercent}% ({completedCount} / {totalLessons} lessons)
            </span>
          </div>
          <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'var(--accent)',
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            ></div>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid-2col" style={{ gridTemplateColumns: '1.6fr 1fr', gap: '32px', alignItems: 'start' }}>
          {/* Left Column: Video Player */}
          <div>
            <div style={{ background: '#000', borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/9', position: 'relative' }}>
              {activeVideo?.videoId ? (
                <iframe
                  id="yt-player-iframe"
                  src={`https://www.youtube.com/embed/${activeVideo.videoId}?enablejsapi=1&autoplay=1`}
                  title={activeVideo.title}
                  style={{ width: '100%', height: '100%', border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div style={{ color: '#fff', display: 'grid', placeItems: 'center', height: '100%' }}>
                  Select a video lesson to begin
                </div>
              )}
            </div>

            <div style={{ marginTop: '24px', padding: '20px', background: 'var(--surface)', border: '1px solid var(--ink)', borderRadius: '12px' }}>
              <p className="eyebrow">NOW PLAYING</p>
              <h2 style={{ fontSize: '1.3rem', margin: '8px 0 12px', fontWeight: 700 }}>{activeVideo?.title}</h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ font: ".75rem 'DM Mono', monospace", color: 'var(--muted)' }}>Duration: {activeVideo?.duration}</span>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={(e) => handleToggleComplete(activeVideo?.videoId, e)}
                  style={{ minHeight: '36px', fontSize: '.78rem', cursor: 'pointer' }}
                >
                  {completedVideoIds.includes(activeVideo?.videoId) ? '✓ Completed' : 'Mark as Complete'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Course Modules (Independent scrollable playlist) */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--ink)',
              padding: '24px',
              borderRadius: '12px',
              height: '550px',
              maxHeight: '550px',
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              boxShadow: 'var(--shadow)',
            }}
          >
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
                    justifyContent: 'space-between',
                    borderRadius: '6px 6px 0 0',
                  }}
                >
                  <span>
                    MODULE {moduleItem.index} — {moduleItem.title}
                  </span>
                  <span style={{ color: 'var(--mint)' }}>{moduleItem.lessons.length} Lessons</span>
                </div>

                <div style={{ border: '1px solid var(--line)', borderTop: 0, borderRadius: '0 0 6px 6px' }}>
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
                          borderBottom: '1px solid var(--line)',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        {/* Custom Animated Checkbox Button (Isolated Event Propagation) */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleComplete(lesson.videoId, e)}
                          aria-label={`Toggle completion for ${lesson.title}`}
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '5px',
                            border: isDone ? '2px solid var(--accent)' : '2px solid #94a3b8',
                            background: isDone ? 'var(--accent)' : '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            padding: 0,
                            outline: 'none',
                          }}
                        >
                          {isDone && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>

                        <span
                          style={{
                            fontSize: '.85rem',
                            fontWeight: isActive ? 700 : 500,
                            color: isDone ? '#64748b' : 'var(--ink)',
                            textDecoration: isDone ? 'line-through' : 'none',
                            transition: 'color 0.2s ease, text-decoration 0.2s ease, opacity 0.2s ease',
                            opacity: isDone ? 0.75 : 1,
                          }}
                        >
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
