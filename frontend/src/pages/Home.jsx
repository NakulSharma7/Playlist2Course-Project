import Header from '../components/Header.jsx';
import Hero from '../components/Hero.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import Features from '../components/Features.jsx';
import UseCases from '../components/UseCases.jsx';
import Faq from '../components/Faq.jsx';
import Cta from '../components/Cta.jsx';
import Footer from '../components/Footer.jsx';

export default function Home() {
  return (
    <div>
      <Header />
      <main id="top">
        <Hero />
        <HowItWorks />
        <Features />
        <UseCases />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
