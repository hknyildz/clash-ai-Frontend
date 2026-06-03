/**
 * Utility functions to generate schema.org structured data (JSON-LD) for GEO (Generative Engine Optimization).
 */

export const generateWebApplicationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ClashDeckster",
  "url": "https://clashdeckster.com",
  "description": "AI-powered Clash Royale deck generator and card upgrade calculator. Scan player profiles to get custom decks based on your card levels.",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
});

export const generateFAQSchema = (faqsList) => {
  if (!faqsList || !faqsList.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqsList.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

export const generateProfileSchema = (player) => {
  if (!player) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": player.name,
      "identifier": player.tag,
      "description": `Clash Royale player profile for ${player.name} (${player.tag}) with trophy level ${player.trophies || 0} and custom card level analytics.`,
      "knowsAbout": [
        "Clash Royale",
        "Clash Royale Decks",
        "Mobile Gaming",
        "Clash Royale Cards Upgrade"
      ],
      "agentInteractionStatistic": {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/InteractAction",
        "userInteractionCount": player.battleCount || 0
      }
    }
  };
};

export const generateClanSchema = (clan) => {
  if (!clan) return null;
  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    "name": clan.name,
    "identifier": clan.tag,
    "description": clan.description || `Clash Royale Clan ${clan.name} (${clan.tag}) members list and Clan Wars statistics.`,
    "sport": "Clash Royale Esports",
    "memberCount": clan.members || 0,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": clan.clanScore || 0,
      "bestRating": "100000",
      "reviewCount": clan.clanWarTrophies || 0
    }
  };
};
