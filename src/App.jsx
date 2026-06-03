import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { fetchFreeDeckStream } from './services/api';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import InputSection from './components/InputSection';
import DeckDisplay from './components/DeckDisplay';
import DeckCarousel from './components/DeckCarousel';
import HowItWorks from './components/HowItWorks';
import PromoSection from './components/PromoSection';
import FaqSection from './components/FaqSection';
import ReleaseNotes from './components/ReleaseNotes';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import AdBanner from './components/AdBanner';
import RouteWatcher from './components/RouteWatcher';

// Lazy loaded page components for PageSpeed optimization (code-splitting)
const DeckBuilder = lazy(() => import('./components/DeckBuilder'));
const PlayerStats = lazy(() => import('./components/PlayerStats'));
const ClanPage = lazy(() => import('./components/ClanPage'));
const ClanDetail = lazy(() => import('./components/ClanDetail'));
const FavoritesPage = lazy(() => import('./components/FavoritesPage'));
const CardUpgradeCalculatorPage = lazy(() => import('./components/CardUpgradeCalculatorPage'));

import './index.css'

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openLogin, isAuthenticated } = useAuth();
  const [tag, setTag] = useState('');
  const [deckData, setDeckData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalExpected, setTotalExpected] = useState(0);
  const [streamDone, setStreamDone] = useState(false);
  const deckResultRef = useRef(null);
  const builderRef = useRef(null);
  const hasScrolledToBuilder = useRef(false);
  const sseCleanupRef = useRef(null);

  // Derive active view from path for UI highlighting (e.g., Navbar)
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path === '/') return 'quick';
    if (path === '/builder') return 'builder';
    if (path.startsWith('/player')) return 'stats';
    if (path === '/clans') return 'clans';
    if (path.startsWith('/clan')) return 'clan-detail';
    if (path.startsWith('/favorites')) return 'favorites';
    if (path === '/card-upgrade-calculator') return 'calculator';
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
        const parsed = JSON.parse(saved);
        // Handle both old (single object) and new (array) format
        setDeckData(Array.isArray(parsed) ? parsed : [parsed]);
      } catch (e) {
        console.error("Failed to parse saved deck data", e);
      }
    }
  }, []);

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => {
      sseCleanupRef.current?.();
    };
  }, []);

  const handleGenerateDeck = (playerTag) => {
    // Cleanup any previous SSE connection
    sseCleanupRef.current?.();

    setLoading(true);
    setError(null);
    setDeckData(null);
    setTotalExpected(0);
    setStreamDone(false);

    // Scroll to loading indicator
    setTimeout(() => {
      deckResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);

    let firstDeckReceived = false;

    const cleanup = fetchFreeDeckStream(playerTag, {
      onInit: (data) => {
        setTotalExpected(data.totalDecks || 3);
      },
      onDeck: (deck) => {
        if (deck && deck.valid !== false) {
          setDeckData(prev => {
            const updated = prev ? [...prev, deck] : [deck];
            localStorage.setItem('deckData', JSON.stringify(updated));
            return updated;
          });

          // Auto-scroll to deck result on first deck arrival
          if (!firstDeckReceived) {
            firstDeckReceived = true;
            setTimeout(() => {
              deckResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);
          }
        }
      },
      onDone: () => {
        setStreamDone(true);
        setLoading(false);
      },
      onError: (err) => {
        console.error('SSE error:', err);
        setLoading(false);
        setStreamDone(true);
        // Check if this is a rate limit error (429)
        if (err?.message?.includes('429') || err?.status === 429) {
          if (isAuthenticated) {
            setError("You've reached your daily deck generation limit. Please try again tomorrow!");
          } else {
            openLogin("You've used your free deck generation. Sign in with Google to continue!");
          }
          return;
        }
        // Check if this is an authentication error (401)
        if (err?.status === 401) {
          openLogin("Your session has expired. Please sign in again.");
          return;
        }
        // Only show error if we didn't receive any decks
        setDeckData(prev => {
          if (!prev || prev.length === 0) {
            setError("Failed to generate deck. Please check the player tag and try again.");
          }
          return prev;
        });
      }
    });

    sseCleanupRef.current = cleanup;
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
      <Navbar 
        activeTab={activeTab}
        onLoginClick={() => openLogin()}
      />

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

        <Suspense fallback={
          <div className="layout-container-lg py-16 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-surface-container-highest border-t-primary animate-spin"></div>
          </div>
        }>
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

                {/* Loading (no decks yet) */}
                {loading && (!deckData || deckData.length === 0) && (
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

                {/* Progressive deck display — renders as decks arrive */}
                {deckData && deckData.length > 0 && (
                  <div ref={deckResultRef}>
                    <DeckCarousel
                      decks={deckData}
                      onViewStats={() => handleNavigateToPlayer(tag)}
                      isStreaming={loading}
                      totalExpected={totalExpected}
                      playerTag={tag}
                    />
                  </div>
                )}
                {/* SEO Content Sections — always visible for indexing */}
                <HowItWorks />
                <FaqSection />
                <PromoSection />
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

            {/* Release Notes / Blog */}
            <Route path="/release-notes" element={
              <div className="mt-6">
                <ReleaseNotes />
              </div>
            } />

            {/* Favorites Tab */}
            <Route path="/favorites" element={
              <div className="mt-6">
                <FavoritesPage />
              </div>
            } />

            {/* Card Upgrade Calculator Tab */}
            <Route path="/card-upgrade-calculator" element={
              <div className="mt-6">
                <CardUpgradeCalculatorPage />
              </div>
            } />
          </Routes>
        </Suspense>

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

