import { SignUp } from '@clerk/clerk-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

export default function SignUpPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '60px 20px' }}>
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/dashboard" />
      </main>
      <Footer />
    </div>
  );
}
