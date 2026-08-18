import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const [url, setUrl] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);
  const [formNote, setFormNote] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = url.trim();
    setIsInvalid(false);

    if (!value) {
      setFormNote('Please paste a playlist URL.');
      setIsInvalid(true);
      return;
    }

    try {
      new URL(value);
      setLoading(true);
      setFormNote('Processing playlist into course modules...');

      // Call backend API to parse YouTube playlist
      const response = await fetch('http://localhost:5000/api/courses/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistUrl: value })
      });

      const data = await response.json();
      if (data.success && data.courseId) {
        setFormNote('Course generated! Redirecting...');
        setTimeout(() => {
          navigate(`/course/${data.courseId}`);
        }, 500);
      } else {
        // Fallback navigation
        navigate('/course/striver');
      }
    } catch (err) {
      console.error('Error generating course:', err);
      // Even if invalid URL syntax, check if it's a playlist query or striver link
      if (value.toLowerCase().includes('list=') || value.toLowerCase().includes('striver')) {
        navigate('/course/striver');
      } else {
        setFormNote('Please enter a valid playlist URL.');
        setIsInvalid(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="hero shell" data-od-id="hero-section">
      <div className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">A clearer way to learn</p>
          <h1 className="display" data-od-id="hero-heading">
            Turn any playlist into a <em>course</em>
            <span className="dot">.</span>
          </h1>
          <p className="lead">
            Paste a playlist. Get a structured learning path. CourseForge organizes educational video playlists so you can learn in a clear, focused and trackable way.
          </p>
          <div className="hero-actions">
            <a href="#playlist" className="button button-primary" data-od-id="hero-primary-cta">
              Create my course <span>↗</span>
            </a>
            <a href="#how-it-works" className="button button-secondary" data-od-id="hero-secondary-cta">
              See how it works
            </a>
          </div>
          <div className="playlist-box" id="playlist" data-od-id="playlist-input-section">
            <form className="playlist-form" onSubmit={handleSubmit} noValidate data-od-id="playlist-form">
              <input
                id="playlist-url"
                type="url"
                placeholder="Paste your playlist URL here (e.g. Striver's A2Z DSA playlist)..."
                aria-label="Playlist URL"
                autoComplete="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                aria-invalid={isInvalid}
              />
              <button className="button button-primary" type="submit" disabled={loading} data-od-id="create-course-button">
                {loading ? 'Processing...' : 'Create course ↗'}
              </button>
            </form>
            <div className="input-meta">
              <span>Supports educational video playlists.</span>
              <span id="form-note" role="status" aria-live="polite">
                {formNote}
              </span>
            </div>
          </div>
        </div>

        <aside className="course-card" aria-label="Example course dashboard preview" data-od-id="course-preview">
          <div className="preview-top">
            <span>Generated course</span>
            <span className="preview-badge">In progress</span>
          </div>
          <h2>
            Striver's A2Z DSA Sheet<span className="dot">.</span>
          </h2>
          <div className="progress-row">
            <div className="progress-number">42%</div>
            <div>
              <div className="bar" aria-label="42 percent complete">
                <span style={{ width: '42%' }}></span>
              </div>
              <p style={{ margin: '8px 0 0', font: ".62rem 'DM Mono',monospace", color: 'oklch(0.97 0.009 88 / .58)' }}>
                23 of 55 lessons complete
              </p>
            </div>
          </div>
          <ol className="modules">
            <li className="module">
              <span className="module-index">01</span>
              <span>Learn the Basics</span>
              <span className="module-time">06/06</span>
            </li>
            <li className="module">
              <span className="module-index">02</span>
              <span>Sorting Techniques</span>
              <span className="module-time">05/05</span>
            </li>
            <li className="module">
              <span className="module-index">03</span>
              <span>Arrays [Easy to Hard]</span>
              <span className="module-time">06/10</span>
            </li>
            <li className="module">
              <span className="module-index">04</span>
              <span>Binary Search</span>
              <span className="module-time">02/06</span>
            </li>
          </ol>
          <div className="course-facts">
            <span>55 videos</span>
            <span>48h 15m</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
