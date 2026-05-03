import { useState, useEffect, useRef } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { fetchFreeDeck } from './services/api';
import Navbar from './components/Navbar';
import InputSection from './components/InputSection';
import DeckDisplay from './components/DeckDisplay';
import DeckBuilder from './components/DeckBuilder';
import PlayerStats from './components/PlayerStats';
import ClanPage from './components/ClanPage';
import ClanDetail from './components/ClanDetail';
import HowItWorks from './components/HowItWorks';
import PromoSection from './components/PromoSection';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import AdBanner from './components/AdBanner';
import RouteWatcher from './components/RouteWatcher';
import './index.css'

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tag, setTag] = useState('');
  const [deckData, setDeckData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const deckResultRef = useRef(null);
  const builderRef = useRef(null);
  const hasScrolledToBuilder = useRef(false);

  // Derive active view from path for UI highlighting (e.g., Navbar)
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path === '/') return 'quick';
    if (path === '/builder') return 'builder';
    if (path.startsWith('/player')) return 'stats';
    if (path === '/clans') return 'clans';
    if (path.startsWith('/clan')) return 'clan-detail';
    return 'quick';
  };

  const activeTab = getActiveTabFromPath();

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
    const saved = localStorage.getItem('deckData');
    if (saved) {
      try {
        setDeckData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved deck data", e);
      }
    }
  }, []);

  const handleGenerateDeck = async (playerTag) => {
    setLoading(true);
    setError(null);
    setDeckData(null);

    // Scroll to loading indicator
    setTimeout(() => {
      deckResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);

    try {
      const data = await fetchFreeDeck(playerTag);
      if (data && data.valid === false) {
        throw new Error(data.tacticMessage || "Player not found. Please check the tag.");
      }
      setDeckData(data);
      setTimeout(() => {
        deckResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate deck. Please check the player tag and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Navigation Handlers
  const handleNavigateToPlayer = (newTag) => {
    let clean = newTag.toUpperCase().replace(/#/g, '');
    navigate(`/player/${clean}`);
  };

  const handleNavigateToClan = (newClanTag) => {
    let clean = newClanTag.toUpperCase().replace(/#/g, '');
    navigate(`/clan/${clean}`);
  };

  return (
    <div className="min-h-screen bg-background text-on-background">
      <RouteWatcher />
      <Navbar activeTab={activeTab} />

      <main className="pt-20">
        {/* Hero Section with Input and Tabs */}
        <InputSection
          tag={tag}
          setTag={setTag}
          onGenerate={handleGenerateDeck}
          isLoading={loading}
          showButton={activeTab === 'quick'}
          activeTab={activeTab}
        />

        <Routes>
          {/* Quick Generate Tab (Home) */}
          <Route path="/" element={
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
                  <DeckDisplay deckData={deckData} onViewStats={() => handleNavigateToPlayer(tag)} />
                </div>
              )}

              {/* SEO Content Sections (show when no deck generated) */}
              {!deckData && (
                <>
                  <HowItWorks />
                  <FaqSection />
                  <PromoSection />
                </>
              )}
            </>
          } />

          {/* Advanced Builder Tab */}
          <Route path="/builder" element={
            <div ref={builderRef}>
              <DeckBuilder playerTag={tag} />
            </div>
          } />

          {/* Player Stats Tab */}
          <Route path="/player" element={
            <PlayerStatsWrapper 
              setTag={setTag} 
              onNavigateToClan={handleNavigateToClan}
              onNavigateToPlayer={handleNavigateToPlayer}
            />
          } />
          <Route path="/player/:playerTag" element={
            <PlayerStatsWrapper 
              setTag={setTag} 
              onNavigateToClan={handleNavigateToClan}
              onNavigateToPlayer={handleNavigateToPlayer}
            />
          } />

          {/* Clans Search Tab */}
          <Route path="/clans" element={
            <ClanPage onSelectClan={handleNavigateToClan} />
          } />

          {/* Clan Detail Tab */}
          <Route path="/clan/:clanTag" element={
            <ClanDetailWrapper onNavigateToPlayer={handleNavigateToPlayer} />
          } />
        </Routes>

        {/* Static Banner */}
        {showAds && <AdBanner type="banner" />}
      </main>

      <Footer />
      <CookieBanner />
    </div>
  )
}

// Wrappers to handle params from URL
import { useParams } from 'react-router-dom';

function PlayerStatsWrapper({ setTag, onNavigateToClan, onNavigateToPlayer }) {
  const { playerTag } = useParams();
  
  useEffect(() => {
    if (playerTag) setTag(playerTag.toUpperCase());
  }, [playerTag, setTag]);

  return (
    <div className="mt-6">
      <PlayerStats 
        playerTag={playerTag}
        setPlayerTag={setTag}
        isActive={true}
        onNavigateToClan={onNavigateToClan}
        onNavigateToPlayer={onNavigateToPlayer}
      />
    </div>
  );
}

function ClanDetailWrapper({ onNavigateToPlayer }) {
  const { clanTag } = useParams();
  const navigate = useNavigate();

  return (
    <div className="mt-6">
      <ClanDetail 
        clanTag={`#${clanTag}`} 
        onBack={() => navigate('/clans')}
        onNavigateToPlayer={onNavigateToPlayer}
      />
    </div>
  );
}

export default App

