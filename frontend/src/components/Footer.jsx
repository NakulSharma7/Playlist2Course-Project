import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

export default function Footer() {
  const { isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();

  const handleCoursesClick = (e) => {
    e.preventDefault();
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <footer className="shell" data-od-id="site-footer">
      <div className="footer-grid">
        <div>
          <Link to="/" className="brand" data-od-id="footer-logo">
            <span className="mark">↗</span>Playlist2Course
          </Link>
          <p className="footer-description">Turn playlists into learning paths.</p>
        </div>
        <div>
          <p className="footer-title">Explore</p>
          <div className="footer-links">
            <Link to="/">Home</Link>
            <a href="/dashboard" onClick={handleCoursesClick}>Courses</a>
            <a href="/#how-it-works">How it works</a>
            <a href="/#features">Features</a>
            <a href="/#faq">FAQ</a>
          </div>
        </div>
        <div>
          <p className="footer-title">Connect</p>
          <div className="footer-links">
            <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
        <div>
          <p className="footer-title">Status</p>
          <div className="footer-links">
            <span>Building in public</span>
            <span>Early access soon</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
