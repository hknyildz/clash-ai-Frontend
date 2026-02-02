import { useState, useEffect } from 'react'
import { fetchFreeDeck } from './services/api';
import InputSection from './components/InputSection';
import DeckDisplay from './components/DeckDisplay';
import DeckBuilder from './components/DeckBuilder';
import AdBanner from './components/AdBanner';
import AdSidebar from './components/AdSidebar';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import './App.css'

// Google Analytics ID from env
const GA_MEASUREMENT_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

function App() {
  const [tag, setTag] = useState('');
  const [activeTab, setActiveTab] = useState('quick'); // 'quick' or 'builder'

  const [deckData, setDeckData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMobileAd, setShowMobileAd] = useState(true);

  // Feature flag for ads
  const showAds = import.meta.env.VITE_SHOW_ADS === 'true';


  useEffect(() => {
    // Send pageview on mount (using native gtag if available)
    if (window.gtag && GA_MEASUREMENT_ID) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: window.location.pathname,
      });
    }
  }, []);

  const handleGenerateDeck = async (playerTag) => {
    // Standard "Free Deck" generation
    setLoading(true);
    setError(null);
    setDeckData(null);

    // Track event
    if (window.gtag) {
      window.gtag('event', 'generate_clicked', {
        'event_category': 'Deck',
        'event_label': playerTag
      });
    }

    try {
      const data = await fetchFreeDeck(playerTag);
      setDeckData(data);
    } catch (err) {
      console.error(err);
      setError("Failed to generate deck. Please check the player tag and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Left Sidebar (Desktop) */}
      {showAds && <AdSidebar side="left" />}

      <div className="main-wrapper">
        <header className="app-header">
          <div className="logo-container">
            <img src="/favicon.png" alt="Clash Deckster Logo" className="app-logo" />
            <h1 className="app-title text-gradient">Clash Deckster</h1>
          </div>
          <p className="app-subtitle">Enter your player tag to let AI build the perfect deck based on your cards.</p>
        </header>

        <main className="main-content">
          <InputSection
            tag={tag}
            setTag={setTag}
            onGenerate={handleGenerateDeck}
            isLoading={loading}
            showButton={activeTab === 'quick'}
          />

          <div className="tabs-container">
            <button
              className={`tab-btn ${activeTab === 'quick' ? 'active' : ''}`}
              onClick={() => setActiveTab('quick')}
            >
              Quick Generate
            </button>
            <button
              className={`tab-btn ${activeTab === 'builder' ? 'active' : ''}`}
              onClick={() => setActiveTab('builder')}
            >
              Advanced Builder
            </button>
          </div>

          {activeTab === 'quick' && (
            <>
              {error && (
                <div className="error-message glass-panel" style={{ color: '#ef4444', padding: '1rem' }}>
                  {error}
                </div>
              )}

              {/* Loading Interstitial */}
              {showAds && loading && <AdBanner type="interstitial" isLoading={loading} />}

              {deckData && !loading && <DeckDisplay deckData={deckData} />}
            </>
          )}

          {activeTab === 'builder' && (
            <DeckBuilder playerTag={tag} />
          )}

          {/* New Content Sections for SEO/AdSense - Only show when no deck is generated yet to keep UI clean */}
          {!deckData && activeTab === 'quick' && (
            <>
              <HowItWorks />
              <Features />
            </>
          )}

          {/* Static Banner (In-Flow) */}
          {showAds && <AdBanner type="banner" />}
        </main>

        <Footer />
      </div>

      {/* Right Sidebar (Desktop) */}
      {showAds && <AdSidebar side="right" />}

      {/* Sticky Mobile Banner */}
      {showAds && showMobileAd && (
        <div className="mobile-sticky-ad">
          <button
            className="close-sticky-ad"
            onClick={() => setShowMobileAd(false)}
            aria-label="Close Ad"
          >
            &times;
          </button>
          <AdBanner type="banner" />
        </div>
      )}

      <CookieBanner />
    </div>
  )
}

export default App
