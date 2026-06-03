import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { faqs } from './FaqSection';
import { generateWebApplicationSchema, generateFAQSchema } from '../utils/schemaGenerator';

const RouteWatcher = () => {
  const location = useLocation();
  const [seo, setSeo] = useState({
    title: 'Clash Deckster — AI Clash Royale Deck Generator & Builder (2026)',
    description: 'Generate winning Clash Royale decks with AI. Analyzes your card levels, current meta, and playstyle to build optimized ladder decks. Free AI deck generator.',
    canonical: 'https://clashdeckster.com',
    schemas: []
  });

  useEffect(() => {
    // 1. Google Analytics 4 - Page View
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_location: window.location.href,
        page_path: location.pathname,
        page_title: document.title
      });
    }

    // 2. AdSense / GPT Refresh
    if (window.googletag && window.googletag.apiReady) {
      window.googletag.cmd.push(() => {
        window.googletag.pubads().refresh();
      });
    } else {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        // Silently fail if adsbygoogle is not ready or limit reached
      }
    }

    // 3. Update SEO metadata state
    const path = location.pathname;
    let title = 'Clash Deckster — AI Clash Royale Deck Generator & Builder (2026)';
    let description = 'Generate winning Clash Royale decks with AI. Analyzes your card levels, current meta, and playstyle to build optimized ladder decks. Free AI deck generator.';
    let schemas = [];

    // Always include WebApplication schema as baseline
    schemas.push(generateWebApplicationSchema());

    if (path.startsWith('/player/')) {
      const tag = path.split('/').pop();
      title = `Player Stats: ${tag} — Clash Royale Profile | Clash Deckster`;
      description = `Real-time Clash Royale statistics for player ${tag}. View card levels, deck progression, trophy history, and upgrade calculator.`;
      // ProfilePage schema is injected inside PlayerStats.jsx once data loads
    } else if (path.startsWith('/player')) {
      title = 'Clash Royale Player Stats Lookup — Card Levels & Progression | Clash Deckster';
      description = 'Search any Clash Royale player by tag. View card levels, trophies, battle history, and card upgrade progression stats.';
    } else if (path.startsWith('/clans')) {
      title = 'Clash Royale Clan Search — Find & Analyze Clans | Clash Deckster';
      description = 'Search Clash Royale clans by name, trophy count, or member size. View clan war logs, member stats, and performance analytics.';
    } else if (path.startsWith('/clan/')) {
      const clanTag = path.split('/').pop();
      title = `Clan Details: ${clanTag} — Members & War Stats | Clash Deckster`;
      description = `Detailed Clash Royale clan analytics for clan ${clanTag}. Member trophy distribution, war participation, and activity stats.`;
      // SportsTeam schema is injected inside ClanDetail.jsx once data loads
    } else if (path === '/' || path === '/builder') {
      if (path === '/builder') {
        title = 'Advanced Deck Builder — Build Custom Clash Royale Decks | Clash Deckster';
        description = 'Build custom Clash Royale decks with Evolved cards, Heroes, and Champions. Smart card picker with rarity filters and AI-powered suggestions.';
      }
      const builderFaqSchema = generateFAQSchema(faqs.builder);
      if (builderFaqSchema) schemas.push(builderFaqSchema);
    } else if (path === '/card-upgrade-calculator') {
      title = 'Clash Royale Card Upgrade Calculator — Max Level Cost (Gold, Cards, Gems) | Clash Deckster';
      description = 'Calculate exactly how much Gold, Cards, and Gems you need to max any Clash Royale card. Works for Common, Rare, Epic, Legendary, and Champion cards. Free calculator.';
      const calcFaqSchema = generateFAQSchema(faqs.calculator);
      if (calcFaqSchema) schemas.push(calcFaqSchema);
    } else if (path === '/release-notes') {
      title = 'Release Notes & Updates | Clash Deckster';
      description = 'Latest updates and feature releases for ClashDeckster AI deck generator.';
    } else if (path === '/favorites') {
      title = 'My Favorite Decks | Clash Deckster';
      description = 'Your saved Clash Royale deck collection. Quick access to your best decks.';
    }

    setSeo({
      title,
      description,
      canonical: `https://clashdeckster.com${path === '/' ? '' : path}`,
      schemas
    });

    // 4. Scroll to Top
    window.scrollTo({ top: 0, behavior: 'smooth' });

  }, [location]);

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={seo.canonical} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={seo.canonical} />
      
      {/* Twitter */}
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:url" content={seo.canonical} />

      {/* Dynamic JSON-LD Structured Data */}
      {seo.schemas && seo.schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default RouteWatcher;
