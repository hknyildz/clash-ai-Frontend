import { useState } from 'react';
import { motion } from 'framer-motion';
import { StrategyIcons } from './StrategyIcons';
import './DeckDisplay.css';

const DeckDisplay = ({ deckData }) => {
    if (!deckData || !deckData.deck) return null;

    const { deck, averageElixir, tacticMessage, deepLink, strategy } = deckData;

    // Sorting Logic: Evolved first, then Hero, then others. 
    // Secondary sort by Elixir (Ascending) for cleaner look.
    const sortedDeck = [...deck].sort((a, b) => {
        // 1. Evolved check
        const aEvolved = a.evolved ? 1 : 0;
        const bEvolved = b.evolved ? 1 : 0;
        if (aEvolved !== bEvolved) return bEvolved - aEvolved;

        // 2. Hero check
        const aHero = a.isHero ? 1 : 0;
        const bHero = b.isHero ? 1 : 0;
        if (aHero !== bHero) return bHero - aHero;

        // 3. Elixir cost check (Ascending)
        return (a.elixirCost || 0) - (b.elixirCost || 0);
    });

    const [copyStatus, setCopyStatus] = useState('Copy to Clash Royale');

    const handleCopyDeck = () => {
        if (deepLink) {
            // Copy to clipboard first
            navigator.clipboard.writeText(deepLink).then(() => {
                setCopyStatus('Link Copied!');

                // Try to open app if not blocked
                setTimeout(() => {
                    window.location.href = deepLink;
                }, 500);

                // Reset button text
                setTimeout(() => {
                    setCopyStatus('Copy to Clash Royale');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                // Fallback: just try to open
                window.location.href = deepLink;
            });
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="deck-display-container">
            {/* Stats Bar Removed */}

            <motion.div
                className="cards-grid"
                variants={container}
                initial="hidden"
                animate="show"
            >
                {sortedDeck.map((card, index) => (
                    <motion.div key={card.id || index} className="card-wrapper" variants={item}>
                        <div className="card-image-container">
                            {/* Prefer evolved/hero images if available/applicable */}
                            <img
                                src={card.evolved ? card.imageUriEvolved : (card.isHero ? card.imageUriHero : card.imageUri)}
                                alt={card.name}
                                className={`clash-card ${card.rarity?.toLowerCase()}`}
                                onError={(e) => { e.target.src = 'https://placehold.co/300x400?text=Card'; }} // Fallback
                            />
                            <div className="card-overlay">
                                <div className="elixir-cost-icon">
                                    <svg viewBox="0 0 24 24" fill="#d946ef" width="28" height="28" className="drop-shadow">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2z" opacity="0" />
                                        <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" opacity="0" />
                                        <path d="M12 2c0 0-7 9.09-7 13.5 0 3.73 3.12 7.15 7 7.15s7-3.42 7-7.15C19 11.09 12 2 12 2z" />
                                    </svg>
                                    <span className="cost-number">{card.elixirCost}</span>
                                </div>
                                <div className="level-badge">
                                    Lvl {card.level || 11}
                                </div>
                            </div>
                        </div>
                        <div className="card-name">{card.name}</div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="deck-meta">
                <div className="elixir-display">
                    <svg viewBox="0 0 24 24" fill="#d946ef" width="24" height="24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2z" opacity="0" />
                        <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" opacity="0" />
                        {/* Drop Icon */}
                        <path d="M12 2c0 0-7 9.09-7 13.5 0 3.73 3.12 7.15 7 7.15s7-3.42 7-7.15C19 11.09 12 2 12 2z" />
                    </svg>
                    <span className="elixir-value">Avg Elixir: {averageElixir?.toFixed(1) || 'N/A'}</span>
                </div>
            </div>

            <div className="tactic-container glass-panel">
                <div className="archetype-header">
                    <span className="archetype-icon">
                        {StrategyIcons[strategy] || StrategyIcons['Hybrid']}
                    </span>
                    <span className="archetype-name">{strategy || 'Hybrid'}</span>
                </div>
                {/* <span className="tactic-label">Strategy</span> // Removed as requested to rely on the name */}

                <p className="tactic-text">{tacticMessage || 'Balanced deck with good synergy.'}</p>
            </div>

            <div className="action-area">
                <button className="copy-btn glow-effect" onClick={handleCopyDeck}>
                    {copyStatus}
                </button>
            </div>
        </div>
    );
};

export default DeckDisplay;
