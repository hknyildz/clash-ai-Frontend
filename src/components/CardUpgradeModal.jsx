import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { rankCardsByProgression, calculateUpgrade, calculateProgression } from '../utils/upgradeCalculator';
import { RARITY_CONFIG, RARITY_DISPLAY } from '../utils/upgradeData';

/**
 * CardUpgradeModal — Full card list popup with rarity filters + card detail view.
 *
 * Two internal views:
 *   1. "list" — Shows all cards in a grid, filterable by rarity
 *   2. "detail" — Shows a single card's upgrade breakdown with target level selector
 *
 * Props:
 *   cards              — Array of CardDto objects from Supercell API
 *   allCards           — Enriched cards array (for images)
 *   initialSelectedCard — If set, opens directly into detail view
 *   onClose            — Callback to close the modal
 */
const CardUpgradeModal = ({ cards, allCards, initialSelectedCard, onClose }) => {
    const [view, setView] = useState(initialSelectedCard ? 'detail' : 'list');
    const [selectedEntry, setSelectedEntry] = useState(initialSelectedCard || null);
    const [rarityFilter, setRarityFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [targetLevel, setTargetLevel] = useState(null);

    // All cards ranked by progression (no limit)
    const allRanked = useMemo(() => rankCardsByProgression(cards, 0), [cards]);

    // Filtered list based on rarity + search
    const filteredCards = useMemo(() => {
        let result = allRanked;
        if (rarityFilter !== 'all') {
            result = result.filter(e => e.card.rarity?.toLowerCase() === rarityFilter);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(e => e.card.name?.toLowerCase().includes(q));
        }
        return result;
    }, [allRanked, rarityFilter, searchQuery]);

    // Rarity counts for filter tabs
    const rarityCounts = useMemo(() => {
        const counts = { all: allRanked.length };
        for (const entry of allRanked) {
            const r = entry.card.rarity?.toLowerCase();
            if (r) counts[r] = (counts[r] || 0) + 1;
        }
        return counts;
    }, [allRanked]);

    // ── Detail view calculations ──
    const detailData = useMemo(() => {
        if (!selectedEntry) return null;

        const { card, absoluteLevel } = selectedEntry;
        const rarity = card.rarity?.toLowerCase();
        const config = RARITY_CONFIG[rarity];
        if (!config) return null;

        const maxLevel = config.maxLevel;
        const effectiveTarget = targetLevel || maxLevel;
        const result = calculateUpgrade(rarity, absoluteLevel, effectiveTarget, card.count || 0);

        return {
            rarity,
            config,
            absoluteLevel,
            maxLevel,
            effectiveTarget,
            result,
        };
    }, [selectedEntry, targetLevel]);

    // Set target level when entering detail view
    const openDetail = useCallback((entry) => {
        setSelectedEntry(entry);
        setTargetLevel(null); // Reset to max
        setView('detail');
    }, []);

    const backToList = useCallback(() => {
        setSelectedEntry(null);
        setTargetLevel(null);
        setView('list');
    }, []);

    /**
     * Resolve image URL for a card.
     */
    const resolveImage = (card) => {
        const enriched = allCards?.find(c => c.id === card.id);
        if (enriched) return enriched.imageUri || card.iconUrls?.medium || null;
        return card.iconUrls?.medium || null;
    };

    const getRarityColor = (rarity) => {
        return RARITY_DISPLAY[rarity?.toLowerCase()]?.color || '#9f8b9d';
    };

    // Close on overlay click
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    // Close on Escape key
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            if (view === 'detail') {
                backToList();
            } else {
                onClose();
            }
        }
    };

    return (
        <div
            className="upgrade-modal-overlay"
            onClick={handleOverlayClick}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
            ref={(el) => el?.focus()}
        >
            <div className="upgrade-modal-container">
                {/* Header */}
                <div className="upgrade-modal-header">
                    <h3>
                        {view === 'detail' && selectedEntry
                            ? selectedEntry.card.name
                            : 'Card Progression'}
                    </h3>
                    <button className="upgrade-modal-close" onClick={onClose}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>
                            close
                        </span>
                    </button>
                </div>

                {view === 'list' ? (
                    <>
                        {/* Rarity Filter Tabs */}
                        <div className="upgrade-modal-filters">
                            {['all', 'common', 'rare', 'epic', 'legendary', 'champion'].map(key => (
                                <button
                                    key={key}
                                    className={`upgrade-filter-tab ${rarityFilter === key ? 'active' : ''}`}
                                    onClick={() => setRarityFilter(key)}
                                    style={
                                        rarityFilter === key && key !== 'all'
                                            ? {
                                                borderColor: `${getRarityColor(key)}44`,
                                                color: getRarityColor(key),
                                                background: `${getRarityColor(key)}18`,
                                            }
                                            : undefined
                                    }
                                >
                                    {key === 'all' ? 'All' : RARITY_DISPLAY[key]?.label || key}
                                    {rarityCounts[key] != null && (
                                        <span style={{ marginLeft: '0.25rem', opacity: 0.6 }}>
                                            ({rarityCounts[key]})
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Search Bar */}
                        <div className="upgrade-modal-search">
                            <div className="upgrade-modal-search-wrap">
                                <span className="material-symbols-outlined">search</span>
                                <input
                                    className="upgrade-modal-search-input"
                                    type="text"
                                    placeholder="Search cards..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Card Grid */}
                        <div className="upgrade-modal-grid">
                            {filteredCards.map((entry, i) => {
                                const { card, absoluteLevel, progression } = entry;
                                const rarity = card.rarity?.toLowerCase();
                                const rarityColor = getRarityColor(rarity);
                                const imgSrc = resolveImage(card);

                                return (
                                    <div
                                        key={card.id}
                                        className="upgrade-card-tile"
                                        style={{ borderColor: `${rarityColor}33` }}
                                        onClick={() => openDetail(entry)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = `${rarityColor}88`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = `${rarityColor}33`;
                                        }}
                                    >
                                        <div className="upgrade-card-tile-img-wrap">
                                            {imgSrc ? (
                                                <img src={imgSrc} alt={card.name} loading="lazy" />
                                            ) : (
                                                <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-outline">help</span>
                                                </div>
                                            )}
                                            <div className="upgrade-card-tile-overlay">
                                                <span className="upgrade-card-tile-name">{card.name}</span>
                                                <span className="upgrade-card-tile-level" style={{ color: rarityColor }}>
                                                    Lv. {absoluteLevel}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="upgrade-progress-bar-wrap">
                                            <div className="upgrade-progress-bar-track">
                                                <div
                                                    className="upgrade-progress-bar-fill"
                                                    style={{
                                                        width: `${progression.percentage}%`,
                                                        background: `linear-gradient(90deg, ${rarityColor}88, ${rarityColor})`,
                                                    }}
                                                />
                                            </div>
                                            <div className="upgrade-progress-label">
                                                <span className="upgrade-progress-pct" style={{ color: rarityColor }}>
                                                    {progression.percentage.toFixed(0)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    /* ═══ DETAIL VIEW ═══ */
                    <div className="upgrade-detail-panel">
                        {/* Back Button */}
                        <button className="upgrade-detail-back" onClick={backToList}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>
                                arrow_back
                            </span>
                            All Cards
                        </button>

                        {selectedEntry && detailData && (
                            <>
                                {/* Card Header */}
                                <div className="upgrade-detail-header">
                                    {resolveImage(selectedEntry.card) && (
                                        <img
                                            className="upgrade-detail-img"
                                            src={resolveImage(selectedEntry.card)}
                                            alt={selectedEntry.card.name}
                                            style={{
                                                border: `2px solid ${getRarityColor(detailData.rarity)}`,
                                            }}
                                        />
                                    )}
                                    <div className="upgrade-detail-info">
                                        <h4>{selectedEntry.card.name}</h4>
                                        <p className="upgrade-detail-meta">
                                            <span
                                                style={{
                                                    color: getRarityColor(detailData.rarity),
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {RARITY_DISPLAY[detailData.rarity]?.label}
                                            </span>
                                            {selectedEntry.card.elixirCost != null && (
                                                <span> · {selectedEntry.card.elixirCost} Elixir</span>
                                            )}
                                        </p>
                                        <div
                                            className="upgrade-detail-level-badge"
                                            style={{
                                                borderLeft: `3px solid ${getRarityColor(detailData.rarity)}`,
                                            }}
                                        >
                                            Level {detailData.absoluteLevel} / {detailData.maxLevel}
                                        </div>
                                        <p className="upgrade-detail-meta" style={{ marginTop: '0.375rem' }}>
                                            Cards owned: <strong style={{ color: 'white' }}>{(selectedEntry.card.count || 0).toLocaleString()}</strong>
                                        </p>
                                    </div>
                                </div>

                                {/* Target Level Selector */}
                                <div className="upgrade-target-selector">
                                    <p className="upgrade-target-label">Target Level</p>
                                    <div className="upgrade-target-buttons">
                                        {Array.from(
                                            { length: detailData.maxLevel - detailData.absoluteLevel },
                                            (_, i) => detailData.absoluteLevel + i + 1
                                        ).map(lvl => (
                                            <button
                                                key={lvl}
                                                className={`upgrade-target-btn ${(targetLevel || detailData.maxLevel) === lvl ? 'active' : ''
                                                    }`}
                                                onClick={() => setTargetLevel(lvl)}
                                            >
                                                {lvl}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Resource Summary */}
                                <ResourceSummary result={detailData.result} rarity={detailData.rarity} />

                                {/* Step-by-Step Table */}
                                {detailData.result.steps.length > 0 && (
                                    <StepsTable
                                        steps={detailData.result.steps}
                                        rarityColor={getRarityColor(detailData.rarity)}
                                    />
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Resource Summary Sub-Component ──
const ResourceSummary = ({ result, rarity }) => {
    const rarityColor = RARITY_DISPLAY[rarity]?.color || '#9f8b9d';

    return (
        <div className="upgrade-resource-grid">
            {/* Cards Needed */}
            <div className="upgrade-resource-card">
                <div className="glow" style={{ background: rarityColor }} />
                <span className="upgrade-resource-label">Cards Needed</span>
                <span className="upgrade-resource-value" style={{ color: rarityColor }}>
                    {result.totalCardsNeeded.toLocaleString()}
                </span>
                <span className="upgrade-resource-sub">
                    Owned: {result.cardsFromOwned.toLocaleString()}
                </span>
            </div>

            {/* Missing Cards */}
            <div className="upgrade-resource-card">
                <div className="glow" style={{ background: result.missingCards > 0 ? 'var(--color-error)' : '#4ade80' }} />
                <span className="upgrade-resource-label">Missing Cards</span>
                <span
                    className="upgrade-resource-value"
                    style={{ color: result.missingCards > 0 ? 'var(--color-error)' : '#4ade80' }}
                >
                    {result.missingCards > 0 ? result.missingCards.toLocaleString() : '✓'}
                </span>
                <span className="upgrade-resource-sub">
                    {result.missingCards > 0 ? 'Still needed' : 'All covered'}
                </span>
            </div>

            {/* Gold Needed */}
            <div className="upgrade-resource-card">
                <div className="glow" style={{ background: 'var(--color-secondary)' }} />
                <span className="upgrade-resource-label">Gold Required</span>
                <span className="upgrade-resource-value" style={{ color: 'var(--color-secondary)' }}>
                    {result.totalGoldNeeded.toLocaleString()}
                </span>
                <span className="upgrade-resource-sub">For all upgrades</span>
            </div>

            {/* Estimated Gems */}
            <div className="upgrade-resource-card">
                <div className="glow" style={{ background: '#4ade80' }} />
                <span className="upgrade-resource-label">Est. Gems</span>
                <span className="upgrade-resource-value" style={{ color: '#4ade80' }}>
                    {result.estimatedGems > 0 ? `~${result.estimatedGems.toLocaleString()}` : '—'}
                </span>
                <span className="upgrade-resource-sub">
                    {result.estimatedGems > 0 ? 'For missing cards' : 'No gems needed'}
                </span>
            </div>
        </div>
    );
};

// ── Step-by-Step Table Sub-Component ──
const StepsTable = ({ steps, rarityColor }) => (
    <div>
        <p
            className="text-xs uppercase tracking-[0.15em] font-black mb-2"
            style={{ color: 'var(--color-on-surface-variant)' }}
        >
            Level-by-Level Breakdown
        </p>
        <table className="upgrade-steps-table">
            <thead>
                <tr>
                    <th>Level</th>
                    <th>Cards</th>
                    <th>Gold</th>
                    <th>Needed Cards</th>
                </tr>
            </thead>
            <tbody>
                {steps.map((step) => (
                    <tr key={step.fromLevel}>
                        <td style={{ fontWeight: 800, fontFamily: 'var(--font-headline)' }}>
                            {step.fromLevel} → {step.toLevel}
                        </td>
                        <td>
                            {step.cardsNeeded > 0 ? step.cardsNeeded.toLocaleString() : '—'}
                        </td>
                        <td>
                            {step.goldNeeded > 0 ? step.goldNeeded.toLocaleString() : '—'}
                        </td>
                        <td>
                            {step.affordable ? (
                                <span className="upgrade-step-affordable">✓ Ready</span>
                            ) : (
                                <span className="upgrade-step-missing">
                                    −{step.deficit.toLocaleString()}
                                </span>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default CardUpgradeModal;
