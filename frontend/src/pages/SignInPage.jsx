import { SignIn } from '@clerk/clerk-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

export default function SignInPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '60px 20px' }}>
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard" />
      </main>
      <Footer />
    </div>
  );
}
