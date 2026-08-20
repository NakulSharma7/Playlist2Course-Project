import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function Header({ hideNavLinks = false }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMobileOpen(prev => !prev);
  };

  const handleCoursesClick = (e) => {
    e.preventDefault();
    setMobileOpen(false);
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <header className="shell" data-od-id="site-header">
      <nav className={`nav ${mobileOpen ? 'mobile-open' : ''}`} data-od-id="primary-navigation">
        <Link to="/" className="brand" aria-label="Playlist2Course home" data-od-id="playlist2course-logo">
          <span className="mark">↗</span>Playlist2Course
        </Link>
        
        {!hideNavLinks && (
          <div className="nav-links">
            <Link to="/" data-od-id="home-link" onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <a href="/dashboard" data-od-id="courses-link" onClick={handleCoursesClick}>
              Courses
            </a>
            <a href="/#how-it-works" data-od-id="how-it-works-link" onClick={() => setMobileOpen(false)}>
              How it works
            </a>
            <a href="/#features" data-od-id="features-link" onClick={() => setMobileOpen(false)}>
              Features
            </a>
            <a href="/#faq" data-od-id="faq-link" onClick={() => setMobileOpen(false)}>
              FAQ
            </a>
          </div>
        )}

        <div className="nav-actions">
          {PUBLISHABLE_KEY ? (
            <>
              <SignedOut>
                <SignInButton mode="modal" forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard">
                  <button className="login" style={{ background: 'none', border: 0, cursor: 'pointer' }}>
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal" forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard">
                  <button className="button button-primary" style={{ cursor: 'pointer' }}>
                    Sign Up <span>↗</span>
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Link to="/dashboard" className="button button-primary" style={{ padding: '8px 16px', fontSize: '.8rem' }}>
                    Dashboard <span>↗</span>
                  </Link>
                  <UserButton showName />
                </div>
              </SignedIn>
            </>
          ) : (
            <>
              <button
                className="login"
                style={{ background: 'none', border: 0, cursor: 'pointer' }}
                onClick={() => setShowAuthModal(true)}
              >
                Sign In
              </button>
              <button
                className="button button-primary"
                onClick={() => setShowAuthModal(true)}
              >
                Sign Up <span>↗</span>
              </button>
            </>
          )}
        </div>

        <button
          className="menu"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={toggleMenu}
          data-od-id="mobile-menu-button"
        >
          <svg width="23" height="18" viewBox="0 0 23 18" fill="none" aria-hidden="true">
            <path d="M1 1h21M1 9h21M1 17h21" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </nav>

      {/* Auth Modal info for setting up Clerk credentials */}
      {showAuthModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 100,
            display: 'grid',
            placeItems: 'center',
            padding: '20px'
          }}
          onClick={() => setShowAuthModal(false)}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--ink)',
              padding: '32px',
              maxWidth: '460px',
              boxShadow: 'var(--shadow)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="eyebrow">Clerk Authentication</p>
            <h3 style={{ fontSize: '1.5rem', margin: '12px 0 16px', fontWeight: 700 }}>Sign In / Sign Up</h3>
            <p style={{ fontSize: '.9rem', color: 'var(--muted)', lineHeight: 1.6 }}>
              Clerk Auth integration is fully set up! Add your <code>VITE_CLERK_PUBLISHABLE_KEY</code> to <code>frontend/.env</code> to activate live Clerk Sign In & Sign Up modals.
            </p>
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="button button-primary" onClick={() => setShowAuthModal(false)}>
                Got it <span>↗</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
