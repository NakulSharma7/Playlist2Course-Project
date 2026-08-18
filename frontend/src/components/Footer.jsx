export default function Footer() {
  return (
    <footer className="shell" data-od-id="site-footer">
      <div className="footer-grid">
        <div>
          <a href="#top" className="brand" data-od-id="footer-logo">
            <span className="mark">↗</span>CourseForge
          </a>
          <p className="footer-description">Turn playlists into learning paths.</p>
        </div>
        <div>
          <p className="footer-title">Explore</p>
          <div className="footer-links">
            <a href="/">Home</a>
            <a href="/course">Courses</a>
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
      <div className="footer-bottom">
        <span>© 2026 CourseForge</span>
      </div>
    </footer>
  );
}
