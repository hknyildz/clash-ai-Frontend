import { useState, useEffect } from 'react'
import ReactGA from 'react-ga4';
import { fetchFreeDeck } from './services/api';
import InputSection from './components/InputSection';
import DeckDisplay from './components/DeckDisplay';
import AdBanner from './components/AdBanner';
import AdSidebar from './components/AdSidebar';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import './App.css'

// Initialize GA (Replace with actual ID later)
try {
  if (ReactGA && typeof ReactGA.initialize === 'function') {
    ReactGA.initialize("G-XXXXXXXXXX");
  } else {
    console.warn("ReactGA not initialized correctly.");
  }
} catch (e) {
  console.warn("GA Initialization failed", e);
}

function App() {
  const [deckData, setDeckData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMobileAd, setShowMobileAd] = useState(true);


  useEffect(() => {
    if (ReactGA && ReactGA.isInitialized) {
      ReactGA.send({ hitType: "pageview", page: window.location.pathname });
    }
  }, []);

  const handleGenerateDeck = async (tag) => {
    setLoading(true);
    setError(null);
    setDeckData(null);

    // Track event
    if (ReactGA && ReactGA.isInitialized) {
      ReactGA.event({
        category: "Deck",
        action: "Generate Clicked",
        label: tag
      });
    }

    try {
      const data = await fetchFreeDeck(tag);
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
      <AdSidebar side="left" />

      <div className="main-wrapper">
        <header className="app-header">
          <h1 className="app-title text-gradient">Clash AI Deck Generator</h1>
          <p className="app-subtitle">Enter your player tag to discover your perfect deck.</p>
        </header>

        <main className="main-content">
          <InputSection onGenerate={handleGenerateDeck} isLoading={loading} />

          {error && (
            <div className="error-message glass-panel" style={{ color: '#ef4444', padding: '1rem' }}>
              {error}
            </div>
          )}

          {/* Loading Interstitial */}
          {loading && <AdBanner type="interstitial" isLoading={loading} />}

          {deckData && !loading && <DeckDisplay deckData={deckData} />}

          {/* Static Banner (In-Flow) */}
          <AdBanner type="banner" />
        </main>

        <Footer />
      </div>

      {/* Right Sidebar (Desktop) */}
      <AdSidebar side="right" />

      {/* Sticky Mobile Banner */}
      {showMobileAd && (
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
