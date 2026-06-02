import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DeckDisplay from './DeckDisplay';

const DeckCarousel = ({ decks, onViewStats, isStreaming = false, totalExpected = 3, playerTag }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [votedDecks, setVotedDecks] = useState(() => {
        try {
            const saved = localStorage.getItem('votedDecks');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch { return new Set(); }
    });
    const touchStartX = useRef(null);
    const containerRef = useRef(null);

    const validDecks = decks ? decks.filter(d => d && d.valid !== false) : [];

    const goTo = (idx) => {
        if (idx >= 0 && idx < validDecks.length) {
            setActiveIndex(idx);
        }
    };

    // Persist votedDecks to localStorage on change
    useEffect(() => {
        localStorage.setItem('votedDecks', JSON.stringify([...votedDecks]));
    }, [votedDecks]);

    // Auto-switch to newest deck when streaming
    useEffect(() => {
        if (isStreaming && validDecks.length > 0) {
            setActiveIndex(validDecks.length - 1);
        }
    }, [validDecks.length, isStreaming]);

    // Clear votes when new generation starts (streaming begins with 1 deck)
    useEffect(() => {
        if (isStreaming && validDecks.length === 1) {
            setVotedDecks(new Set());
        }
    }, [isStreaming, validDecks.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e) => {
            if (validDecks.length === 0) return;
            if (e.key === 'ArrowLeft') goTo(activeIndex - 1);
            if (e.key === 'ArrowRight') goTo(activeIndex + 1);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [activeIndex, validDecks.length]);

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) goTo(activeIndex + 1);
            else goTo(activeIndex - 1);
        }
        touchStartX.current = null;
    };

    if (!decks || decks.length === 0) return null;
    if (validDecks.length === 0) return null;

    // Single deck — no carousel needed (but show streaming placeholder if more coming)
    if (validDecks.length === 1 && !isStreaming) {
        return <DeckDisplay deckData={validDecks[0]} onViewStats={onViewStats} deckLabel={getDeckLabel(validDecks[0])} playerTag={playerTag} hasVoted={votedDecks.has(0)} onVoted={() => setVotedDecks(prev => new Set(prev).add(0))} />;
    }

    const currentDeck = validDecks[Math.min(activeIndex, validDecks.length - 1)];

    // Tab labels: show pending placeholders for streaming
    const totalTabs = isStreaming ? Math.max(totalExpected, validDecks.length) : validDecks.length;

    return (
        <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Carousel Tabs — prominent, below header */}
            <div className="layout-container-lg">
                <div className="flex items-center justify-center gap-2 sm:gap-3 py-4 mt-4">
                    {/* Left Arrow */}
                    <button
                        onClick={() => goTo(activeIndex - 1)}
                        disabled={activeIndex === 0}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-on-surface hover:bg-surface-container-highest hover:border-primary/50 transition-all disabled:opacity-20 disabled:cursor-not-allowed shrink-0"
                        aria-label="Previous deck"
                    >
                        <span className="material-symbols-outlined text-lg">chevron_left</span>
                    </button>

                    {/* Deck Tabs */}
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                        {Array.from({ length: totalTabs }).map((_, idx) => {
                            const deck = validDecks[idx];
                            const isLoaded = !!deck;
                            const isActive = idx === activeIndex;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => isLoaded && goTo(idx)}
                                    disabled={!isLoaded}
                                    className={`relative transition-all duration-300 shrink-0 ${
                                        isActive
                                            ? 'scale-100'
                                            : isLoaded
                                                ? 'scale-95 opacity-70 hover:opacity-90'
                                                : 'scale-95 opacity-40'
                                    }`}
                                >
                                    <div className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider border-2 transition-all duration-300 whitespace-nowrap ${
                                        isActive
                                            ? 'bg-primary/15 text-primary border-primary/60 shadow-[0_0_20px_rgba(251,171,255,0.25)]'
                                            : isLoaded
                                                ? 'bg-surface-container-high text-on-surface border-outline-variant/40 hover:border-primary/40 hover:bg-surface-container-highest'
                                                : 'bg-surface-container border-outline-variant/20 text-on-surface-variant/50'
                                    }`}>
                                        {isLoaded
                                            ? (
                                                <>
                                                    {/* Mobile: WC only / Desktop: WC · Strategy */}
                                                    <span className="sm:hidden">{getMobileLabel(deck)}</span>
                                                    <span className="hidden sm:inline">{getDeckLabel(deck)}</span>
                                                </>
                                            )
                                            : (
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-3 h-3 rounded-full border-2 border-primary/40 border-t-transparent animate-spin"></span>
                                                    <span className="hidden sm:inline">Loading...</span>
                                                    <span className="sm:hidden">···</span>
                                                </span>
                                            )
                                        }
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={() => goTo(activeIndex + 1)}
                        disabled={activeIndex === validDecks.length - 1}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-on-surface hover:bg-surface-container-highest hover:border-primary/50 transition-all disabled:opacity-20 disabled:cursor-not-allowed shrink-0"
                        aria-label="Next deck"
                    >
                        <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Deck Content with Animation */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                    <DeckDisplay
                        deckData={currentDeck}
                        onViewStats={onViewStats}
                        deckLabel={getDeckLabel(currentDeck)}
                        playerTag={playerTag}
                        hasVoted={votedDecks.has(activeIndex)}
                        onVoted={() => setVotedDecks(prev => new Set(prev).add(activeIndex))}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Streaming progress indicator */}
            {isStreaming && validDecks.length < totalExpected && (
                <div className="layout-container-lg mt-4">
                    <div className="flex items-center justify-center gap-3 py-3 px-5 rounded-xl bg-surface-container-high/60 border border-primary/20 backdrop-blur-sm">
                        <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                        <span className="text-sm text-on-surface-variant font-medium">
                            Building deck {validDecks.length + 1} of {totalExpected}...
                        </span>
                        <div className="flex-1 max-w-[120px] h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${(validDecks.length / totalExpected) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Full label for desktop tabs: "Miner · Cycle/Control"
 */
function getDeckLabel(deck) {
    if (!deck) return 'Deck';
    const wc = deck.winCondition;
    const strategy = deck.strategy;

    if (wc && strategy) {
        return `${wc} · ${strategy}`;
    }
    if (wc) return wc;
    if (strategy) return strategy;
    return 'Deck';
}

/**
 * Short label for mobile tabs: just the WC name
 */
function getMobileLabel(deck) {
    if (!deck) return 'Deck';
    return deck.winCondition || deck.strategy || 'Deck';
}

export default DeckCarousel;
