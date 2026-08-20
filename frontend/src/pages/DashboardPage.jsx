import { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useUser, UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { API_BASE_URL } from '../config.js';

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('courses');

  // Redirect to sign in if user is not authenticated
  if (isLoaded && !isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  // Fetch user courses on mount
  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const query = user?.id ? `?clerkUserId=${user.id}&userId=${user.id}` : '';
        const res = await fetch(`${API_BASE_URL}/courses${query}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setCourses(data);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [user?.id]);

  // Handle course creation
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!playlistUrl.trim()) {
      setErrorMsg('Please paste a YouTube playlist URL.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const res = await fetch(`${API_BASE_URL}/courses/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playlistUrl: playlistUrl.trim(),
          userId: user?.id || 'guest_user',
          clerkUserId: user?.id || 'guest_user'
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error(`Server returned ${res.status}: ${res.statusText || 'Endpoint not found'}`);
      }

      if (res.ok && data?.success && data?.course) {
        setCourses((prev) => [data.course, ...prev.filter((c) => c.courseId !== data.course.courseId)]);
        setShowCreateModal(false);
        setPlaylistUrl('');
        navigate(`/course/${data.courseId}`);
      } else {
        setErrorMsg(data?.error || `Failed to generate course (Status: ${res.status})`);
      }
    } catch (err) {
      console.error('Course creation error:', err);
      setErrorMsg(err.message || 'Error communicating with server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: '260px',
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 20px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 10,
        }}
      >
        <div>
          {/* Brand Logo */}
          <Link
            to="/"
            className="brand"
            style={{ fontSize: '1.25rem', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '36px' }}
          >
            <span className="mark">↗</span>Playlist2Course
          </Link>

          {/* Navigation Items: Courses & Profile */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('courses')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '8px',
                background: activeTab === 'courses' ? 'var(--ink)' : 'transparent',
                color: activeTab === 'courses' ? 'var(--bg)' : 'var(--muted)',
                fontWeight: 600,
                fontSize: '.9rem',
                border: 0,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              Courses
            </button>
          </nav>
        </div>

        {/* User Profile Section */}
        <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <SignedIn>
            <UserButton showName />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="button button-primary" style={{ width: '100%' }}>
                Sign In <span>↗</span>
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </aside>

      {/* ── Main Workspace ── */}
      <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>
        {/* Header Bar */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <p className="eyebrow" style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)' }}>
              Learning Dashboard
            </p>
            <h1 className="display" style={{ fontSize: '2rem', margin: '4px 0 0', fontWeight: 800 }}>
              Welcome back{user?.firstName ? `, ${user.firstName}` : ''}<span className="dot">.</span>
            </h1>
          </div>

          <button
            className="button button-primary"
            onClick={() => setShowCreateModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '1.2rem', leading: 1 }}>+</span> Create Course
          </button>
        </header>

        {/* Stats Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '18px',
            marginBottom: '40px',
          }}
        >
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px', borderRadius: '12px' }}>
            <p style={{ font: ".75rem 'DM Mono', monospace", color: 'var(--muted)', textTransform: 'uppercase' }}>Active Courses</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0 0' }}>{courses.length}</p>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px', borderRadius: '12px' }}>
            <p style={{ font: ".75rem 'DM Mono', monospace", color: 'var(--muted)', textTransform: 'uppercase' }}>Total Modules</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0 0' }}>
              {courses.reduce((acc, c) => acc + (c.modules?.length || 0), 0)}
            </p>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px', borderRadius: '12px' }}>
            <p style={{ font: ".75rem 'DM Mono', monospace", color: 'var(--muted)', textTransform: 'uppercase' }}>Status</p>
            <p style={{ fontSize: '1rem', fontWeight: 700, margin: '8px 0 0', color: 'var(--accent)' }}>● In Progress</p>
          </div>
        </div>

        {/* Courses Section */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Your Courses</h2>
            <span style={{ font: ".8rem 'DM Mono', monospace", color: 'var(--muted)' }}>{courses.length} Courses available</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px',
            }}
          >
            {/* 1. Add New Course (+) Card */}
            <div
              onClick={() => setShowCreateModal(true)}
              style={{
                background: 'var(--surface)',
                border: '2px dashed var(--ink)',
                borderRadius: '16px',
                minHeight: '220px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'var(--ink)',
                  color: 'var(--bg)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '2rem',
                  fontWeight: 300,
                  marginBottom: '14px',
                }}
              >
                +
              </div>
              <p style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Add New Course</p>
              <p style={{ fontSize: '.8rem', color: 'var(--muted)', margin: '4px 0 0', textAlign: 'center' }}>
                Paste any YouTube playlist link
              </p>
            </div>

            {/* 2. Course List Cards */}
            {loading ? (
              <div style={{ gridColumn: 'span 2', padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
                Loading courses...
              </div>
            ) : (
              courses.map((course) => (
                <div
                  key={course.courseId || course._id}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--ink)',
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '220px',
                    boxShadow: 'var(--shadow)',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div>
                    <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span className="tag" style={{ fontSize: '.7rem', textTransform: 'uppercase' }}>
                        {course.modules?.length || 0} Modules
                      </span>
                      <span style={{ font: ".75rem 'DM Mono', monospace", color: 'var(--muted)' }}>
                        {course.totalVideos || 0} Videos
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px', lineHeight: 1.3 }}>
                      {course.title}
                    </h3>
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    {/* Progress Bar & Percentage */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ font: "600 .75rem 'DM Mono', monospace", color: 'var(--muted)' }}>Progress</span>
                      <span style={{ font: "700 .8rem 'DM Mono', monospace", color: 'var(--accent)' }}>
                        {course.progressPercent || 0}% ({course.completedCount || 0}/{course.totalVideos || 0})
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                      <div
                        style={{
                          width: `${course.progressPercent || 0}%`,
                          height: '100%',
                          background: 'var(--accent)',
                          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      ></div>
                    </div>

                    <Link
                      to={`/course/${course.courseId}`}
                      className="button button-primary"
                      style={{ width: '100%', textDecoration: 'none', textAlign: 'center', display: 'block' }}
                    >
                      Continue Learning <span>→</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* ── Create Course Modal ── */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'grid',
            placeItems: 'center',
            padding: '20px',
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '2px solid var(--ink)',
              padding: '32px',
              maxWidth: '500px',
              width: '100%',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p className="eyebrow" style={{ margin: 0 }}>
                Course Generator
              </p>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 0, fontSize: '1.2rem', cursor: 'pointer', color: 'var(--muted)' }}
              >
                ✕
              </button>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px' }}>Import YouTube Playlist</h3>
            <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: '20px', lineHeight: 1.5 }}>
              Paste any educational YouTube playlist URL to parse and organize it into a structured course.
            </p>

            <form onSubmit={handleCreateCourse}>
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/playlist?list=..."
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '.9rem',
                    border: '1px solid var(--ink)',
                    borderRadius: '8px',
                    outline: 'none',
                    background: 'var(--bg)',
                  }}
                  autoFocus
                />
                {errorMsg && (
                  <p style={{ color: '#ef4444', fontSize: '.8rem', margin: '8px 0 0', fontWeight: 600 }}>{errorMsg}</p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '.85rem',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={isSubmitting}
                  style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  {isSubmitting ? 'Generating...' : 'Create Course'} <span>↗</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
