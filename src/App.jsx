import { useState, useEffect, useRef } from 'react'
import { fetchFreeDeck } from './services/api';
import Navbar from './components/Navbar';
import InputSection from './components/InputSection';
import DeckDisplay from './components/DeckDisplay';
import DeckBuilder from './components/DeckBuilder';
import HowItWorks from './components/HowItWorks';
import PromoSection from './components/PromoSection';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import AdBanner from './components/AdBanner';
import './index.css'

// Google Analytics ID from env
const GA_MEASUREMENT_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

function App() {
  const [tag, setTag] = useState('');
  const [activeTab, setActiveTab] = useState('quick'); // 'quick' or 'builder'
  const [deckData, setDeckData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const deckResultRef = useRef(null);
  const builderRef = useRef(null);
  const hasScrolledToBuilder = useRef(false);

  // Auto-scroll to builder on first switch
  useEffect(() => {
    if (activeTab === 'builder' && !hasScrolledToBuilder.current) {
      setTimeout(() => {
        builderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        hasScrolledToBuilder.current = true;
      }, 100);
    }
  }, [activeTab]);

  // Feature flag for ads
  const showAds = import.meta.env.VITE_SHOW_ADS === 'true';

  useEffect(() => {
    if (window.gtag && GA_MEASUREMENT_ID) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: window.location.pathname,
      });
    }
  }, []);

  const handleGenerateDeck = async (playerTag) => {
    setLoading(true);
    setError(null);
    setDeckData(null);

    if (window.gtag) {
      window.gtag('event', 'generate_clicked', {
        'event_category': 'Deck',
        'event_label': playerTag
      });
    }

    try {
      const data = await fetchFreeDeck(playerTag);
      setDeckData(data);
      setTag('');
      setTimeout(() => {
        deckResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error(err);
      setError("Failed to generate deck. Please check the player tag and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section with Input and Tabs */}
        <InputSection
          tag={tag}
          setTag={setTag}
          onGenerate={handleGenerateDeck}
          isLoading={loading}
          showButton={activeTab === 'quick'}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />



        {/* Quick Generate Tab */}
        {activeTab === 'quick' && (
          <>
            {error && (
              <div className="layout-container-lg mt-6">
                <div className="glass-panel rounded-lg p-4 border border-error/30 text-error">
                  {error}
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div ref={deckResultRef} className="layout-container-lg mt-12 py-16 flex flex-col items-center justify-center text-center">
                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 rounded-full border-4 border-surface-container-highest"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-3xl animate-pulse">bolt</span>
                  </div>
                </div>
                <h3 className="text-2xl font-headline font-black uppercase text-white mb-2 tracking-widest">
                  Forging Destiny...
                </h3>
                <p className="text-on-surface-variant max-w-md mx-auto italic">
                  Let the Deckster do his job 🔮
                </p>
              </div>
            )}
            {showAds && loading && <AdBanner type="interstitial" isLoading={loading} />}

            {deckData && !loading && (
              <div ref={deckResultRef}>
                <DeckDisplay deckData={deckData} />
              </div>
            )}
          </>
        )}

        {/* Advanced Builder Tab */}
        {activeTab === 'builder' && (
          <div ref={builderRef}>
            <DeckBuilder playerTag={tag} />
          </div>
        )}

        {/* SEO Content Sections (show when no deck generated) */}
        {!deckData && activeTab === 'quick' && (
          <>
            <HowItWorks />
            <FaqSection />
            <PromoSection />
          </>
        )}

        {/* Static Banner */}
        {showAds && <AdBanner type="banner" />}
      </main>

      <Footer />
      <CookieBanner />
    </div>
  )
}

export default App
