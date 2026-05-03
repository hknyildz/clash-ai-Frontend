import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const RouteWatcher = () => {
  const location = useLocation();

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
    // If using Google Publisher Tag (GPT)
    if (window.googletag && window.googletag.apiReady) {
      window.googletag.cmd.push(() => {
        window.googletag.pubads().refresh();
      });
    } else {
      // Fallback for adsbygoogle: Push an empty object or handle re-render in AdBanner
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        // Silently fail if adsbygoogle is not ready or limit reached
      }
    }

    // 3. Dynamic Meta Tags & SEO
    updateMetaTags(location.pathname);

    // 4. Scroll to Top
    window.scrollTo({ top: 0, behavior: 'smooth' });

  }, [location]);

  const updateMetaTags = (path) => {
    let title = 'Clash Deckster - Forge Your Ultimate Destiny';
    let description = 'Analyze your Clash Royale playstyle and generate data-backed decks designed for total arena domination.';

    if (path.startsWith('/player/')) {
      const tag = path.split('/').pop();
      title = `Player Stats: ${tag} | Clash Deckster`;
      description = `View real-time Clash Royale statistics, battle logs, and custom deck recommendations for player ${tag}.`;
    } else if (path.startsWith('/clans')) {
      title = 'Search Clans | Clash Deckster';
      description = 'Find the best Clash Royale clans and analyze member performance.';
    } else if (path.startsWith('/clan/')) {
      const clanTag = path.split('/').pop();
      title = `Clan Details: ${clanTag} | Clash Deckster`;
      description = `Deep dive into clan ${clanTag} members, trophy counts, and activity logs.`;
    } else if (path === '/builder') {
      title = 'Advanced Deck Builder | Clash Deckster';
      description = 'Build custom Clash Royale decks with advanced filters for Evolved and Hero cards.';
    }

    document.title = title;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }
  };

  return null;
};

export default RouteWatcher;
