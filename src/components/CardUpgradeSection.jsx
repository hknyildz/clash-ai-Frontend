import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getCollectionSummary, calculateUpgrade, calculateProgression } from '../utils/upgradeCalculator';
import { RARITY_CONFIG, RARITY_DISPLAY } from '../utils/upgradeData';
import CardUpgradeModal from './CardUpgradeModal';
import './CardUpgradeSection.css';

/**
 * CardUpgradeSection — Shows current deck (8 cards) with upgrade stats.
 *
 * Props:
 *   currentDeck — Array of CardDto objects from the player's current deck
 *   cards       — Full card collection (for count data + modal)
 *   allCards    — Enriched Card objects (from /cards endpoint, for images)
 */
const CardUpgradeSection = ({ currentDeck, cards, allCards }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);

    const summary = useMemo(() => getCollectionSummary(cards), [cards]);

    /**
     * Enrich current deck cards with count data from the full collection.
     * The currentDeck array doesn't always have `count`, so we cross-reference.
     */
    const deckEntries = useMemo(() => {
        if (!currentDeck || currentDeck.length === 0) return [];

        return currentDeck
            .filter(card => card.rarity && card.level != null)
            .map(card => {
                const rarity = card.rarity.toLowerCase();
                const config = RARITY_CONFIG[rarity];
                if (!config) return null;

                // Cross-reference with full collection for card count
                const fullCard = cards?.find(c => c.id === card.id);
                const count = fullCard?.count ?? card.count ?? 0;

                const absoluteLevel = card.level + config.relativeLevel;
                const progression = calculateProgression(rarity, absoluteLevel, count);

                return {
                    card: { ...card, count },
                    absoluteLevel,
                    progression,
                };
            })
            .filter(entry => entry !== null);
    }, [currentDeck, cards]);

    if (deckEntries.length === 0) return null;

    const resolveCardImage = (card) => {
        const enriched = allCards?.find(c => c.id === card.id);
        if (enriched) return enriched.imageUri || card.iconUrls?.medium || null;
        return card.iconUrls?.medium || null;
    };

    const getRarityColor = (rarity) => {
        return RARITY_DISPLAY[rarity?.toLowerCase()]?.color || 'rgba(82, 66, 81, 0.3)';
    };

    const handleCardClick = (entry) => {
        setSelectedCard(entry);
        setModalOpen(true);
    };

    const handleViewAll = () => {
        setSelectedCard(null);
        setModalOpen(true);
    };

    return (
        <>
            <motion.div
                className="upgrade-section"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                {/* Section Header */}
                <div className="upgrade-section-header">
                    <div>
                        <div className="upgrade-section-title">
                            <span
                                className="material-symbols-outlined text-primary text-lg"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                trending_up
                            </span>
                            <h3 className="text-xs uppercase tracking-[0.2em] font-black text-tertiary">
                                Current Deck Progression
                            </h3>
                        </div>
                        <p className="upgrade-section-summary">
                            {summary.maxed} / {summary.total} cards maxed · {summary.percentage}% complete
                        </p>
                    </div>
                    <button className="upgrade-view-all" onClick={handleViewAll}>
                        All Cards
                        <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>
                            arrow_forward
                        </span>
                    </button>
                </div>

                {/* Current Deck Grid (8 cards) */}
                <div className="upgrade-top-grid">
                    {deckEntries.map((entry, i) => {
                        const { card, absoluteLevel, progression } = entry;
                        const rarity = card.rarity?.toLowerCase();
                        const rarityColor = getRarityColor(rarity);
                        const imgSrc = resolveCardImage(card);

                        return (
                            <motion.div
                                key={card.id}
                                className="upgrade-card-tile"
                                style={{ borderColor: `${rarityColor}33` }}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.35 + i * 0.04 }}
                                onClick={() => handleCardClick(entry)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = `${rarityColor}88`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = `${rarityColor}33`;
                                }}
                            >
                                {/* Rarity Badge */}
                                <span
                                    className="upgrade-rarity-badge"
                                    style={{
                                        background: `${rarityColor}22`,
                                        color: rarityColor,
                                        border: `1px solid ${rarityColor}44`,
                                    }}
                                >
                                    {RARITY_DISPLAY[rarity]?.label || rarity}
                                </span>

                                {/* Card Image */}
                                <div className="upgrade-card-tile-img-wrap">
                                    {imgSrc ? (
                                        <img src={imgSrc} alt={card.name} loading="lazy" />
                                    ) : (
                                        <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
                                            <span className="material-symbols-outlined text-outline">
                                                help
                                            </span>
                                        </div>
                                    )}
                                    <div className="upgrade-card-tile-overlay">
                                        <span className="upgrade-card-tile-name">{card.name}</span>
                                        <span
                                            className="upgrade-card-tile-level"
                                            style={{ color: rarityColor }}
                                        >
                                            Lv. {absoluteLevel}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="upgrade-progress-bar-wrap">
                                    <div className="upgrade-progress-bar-track">
                                        <div
                                            className="upgrade-progress-bar-fill"
                                            style={{
                                                width: `${progression.percentage}%`,
                                                background: `linear-gradient(90deg, ${rarityColor}88, ${rarityColor})`,
                                                boxShadow: `0 0 8px ${rarityColor}44`,
                                            }}
                                        />
                                    </div>
                                    <div className="upgrade-progress-label">
                                        <span
                                            className="upgrade-progress-pct"
                                            style={{ color: rarityColor }}
                                        >
                                            {progression.percentage.toFixed(1)}%
                                        </span>
                                        <span className="upgrade-progress-cards">
                                            {progression.totalCardsToMax > 0
                                                ? `${progression.totalCardsToMax} left`
                                                : 'MAX'}
                                        </span>
                                    </div>
                                </div>

                                {/* To Max Stats */}
                                {(() => {
                                    const config = RARITY_CONFIG[rarity];
                                    if (!config) return null;
                                    const result = calculateUpgrade(rarity, absoluteLevel, config.maxLevel, card.count || 0);
                                    return (
                                        <div className="upgrade-card-tile-stats">
                                            <div className="upgrade-stats-title">Need to Max</div>
                                            <div className="upgrade-stats-row">
                                                <span className="material-symbols-outlined icon-card">style</span>
                                                <span>{result.totalCardsNeeded.toLocaleString()}</span>
                                            </div>
                                            <div className="upgrade-stats-row">
                                                <span className="material-symbols-outlined icon-gold">toll</span>
                                                <span>{result.totalGoldNeeded.toLocaleString()}</span>
                                            </div>
                                            <div className="upgrade-stats-row">
                                                <span className="material-symbols-outlined icon-gem">diamond</span>
                                                <span>{result.estimatedGems.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Modal: Full Card List + Detail View */}
            {modalOpen && (
                <CardUpgradeModal
                    cards={cards}
                    allCards={allCards}
                    initialSelectedCard={selectedCard}
                    onClose={() => {
                        setModalOpen(false);
                        setSelectedCard(null);
                    }}
                />
            )}
        </>
    );
};

export default CardUpgradeSection;
