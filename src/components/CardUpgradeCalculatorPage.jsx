import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPlayerStats, fetchAllCards } from '../services/api';
import { rankCardsByProgression, calculateUpgrade, calculateProgression } from '../utils/upgradeCalculator';
import { RARITY_CONFIG, RARITY_DISPLAY } from '../utils/upgradeData';
import FaqSection from './FaqSection';
import './CardUpgradeCalculatorPage.css';

/**
 * CardUpgradeCalculatorPage — Standalone page at /card-upgrade-calculator
 *
 * Displays card upgrade calculations.
 * Supports:
 *   1. No player loaded → loads all game cards by default so users can calculate costs starting from any level.
 *   2. Player loaded → shows user card collection with actual levels and progression, plus a search status badge.
 *
 * Supports navigation from player profile via router state:
 *   navigate('/card-upgrade-calculator', { state: { cards, allCards, playerName, playerTag } })
 */
const CardUpgradeCalculatorPage = () => {
    const location = useLocation();

    // Player data state
    const [playerTag, setPlayerTag] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [cards, setCards] = useState(null);
    const [allCards, setAllCards] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Interactive view state
    const [rarityFilter, setRarityFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(null);
    const [targetLevel, setTargetLevel] = useState(null);

    // Collapsible rarity table (collapsed by default on mobile)
    const [rarityTableOpen, setRarityTableOpen] = useState(false);

    // Ref for scrolling to card detail area
    const interactiveRef = useRef(null);

    // ── Load all cards on mount if not loaded via state ──
    useEffect(() => {
        const loadDefaultCards = async () => {
            if (!allCards && !loading) {
                try {
                    const data = await fetchAllCards();
                    setAllCards(data);
                } catch (err) {
                    console.error('[Calculator] Failed to load default cards:', err);
                }
            }
        };
        loadDefaultCards();
    }, [allCards, loading]);

    // ── Auto-load from router state (coming from player profile) ──
    useEffect(() => {
        const state = location.state;
        if (state?.cards && state?.allCards) {
            setCards(state.cards);
            setAllCards(state.allCards);
            setPlayerName(state.playerName || '');
            const cleanTag = (state.playerTag || '').toUpperCase().replace(/#/g, '');
            setPlayerTag(cleanTag);
            if (state.selectedEntry) {
                const entry = state.selectedEntry;
                setSelectedEntry(entry);
                setCurrentLevel(entry.absoluteLevel);
                const rarity = entry.card.rarity?.toLowerCase();
                const config = RARITY_CONFIG[rarity];
                const maxLevel = config ? config.maxLevel : 16;
                setTargetLevel(maxLevel);
            }
        }
    }, [location.state]);

    // ── Fetch player data by tag ──
    const handleSearch = useCallback(async () => {
        if (!playerTag.trim()) return;
        setLoading(true);
        setError('');
        setCards(null);
        setSelectedEntry(null);
        setCurrentLevel(null);
        setTargetLevel(null);

        const cleanTag = playerTag.trim().toUpperCase().replace(/#/g, '');

        try {
            const [statsData, cardsData] = await Promise.all([
                fetchPlayerStats(cleanTag),
                fetchAllCards(),
            ]);
            setCards(statsData.cards || []);
            setAllCards(cardsData || []);
            setPlayerName(statsData.name || cleanTag);
            setPlayerTag(cleanTag);
        } catch (err) {
            console.error('[Calculator] Fetch error:', err);
            setError('Player not found. Check the tag and try again.');
        } finally {
            setLoading(false);
        }
    }, [playerTag]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handleClearPlayer = () => {
        setCards(null);
        setPlayerName('');
        setPlayerTag('');
        setSelectedEntry(null);
        setCurrentLevel(null);
        setTargetLevel(null);
        // Clear history state so refresh doesn't reload the player data
        window.history.replaceState({}, document.title);
    };

    // ── Card ranking & filtering ──
    const allRanked = useMemo(() => {
        if (cards) {
            return rankCardsByProgression(cards, 0);
        }
        if (allCards) {
            // No player loaded: build default entries for all cards at their starting levels
            return allCards.map(c => {
                const rarity = c.rarity?.toLowerCase() || 'common';
                const config = RARITY_CONFIG[rarity];
                const startLevel = config ? config.startLevel : 1;
                return {
                    card: {
                        ...c,
                        level: startLevel - (config ? config.relativeLevel : 0),
                        count: 0
                    },
                    absoluteLevel: startLevel,
                    progression: {
                        percentage: 0,
                        levelsRemaining: config ? config.maxLevel - startLevel : 15,
                        totalCardsToMax: config ? config.upgradeMaterials.reduce((sum, n) => sum + n, 0) : 0,
                        ownedCards: 0
                    }
                };
            });
        }
        return [];
    }, [cards, allCards]);

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

    const rarityCounts = useMemo(() => {
        const counts = { all: allRanked.length };
        for (const entry of allRanked) {
            const r = entry.card.rarity?.toLowerCase();
            if (r) counts[r] = (counts[r] || 0) + 1;
        }
        return counts;
    }, [allRanked]);

    // ── Detail calculations ──
    const detailData = useMemo(() => {
        if (!selectedEntry) return null;
        const { card } = selectedEntry;
        const rarity = card.rarity?.toLowerCase();
        const config = RARITY_CONFIG[rarity];
        if (!config) return null;

        const maxLevel = config.maxLevel;
        const effectiveCurrent = currentLevel !== null ? currentLevel : selectedEntry.absoluteLevel;
        const effectiveTarget = targetLevel !== null ? targetLevel : maxLevel;

        // If the user changed currentLevel, owned cards count resets to 0 (default estimate).
        // Otherwise, use the actual card count.
        const owned = (effectiveCurrent === selectedEntry.absoluteLevel) ? (card.count || 0) : 0;

        const result = calculateUpgrade(rarity, effectiveCurrent, effectiveTarget, owned);
        return {
            rarity,
            config,
            absoluteLevel: effectiveCurrent,
            maxLevel,
            effectiveTarget,
            result,
            originalLevel: selectedEntry.absoluteLevel
        };
    }, [selectedEntry, currentLevel, targetLevel]);

    const openDetail = useCallback((entry) => {
        setSelectedEntry(entry);
        setCurrentLevel(entry.absoluteLevel);
        const rarity = entry.card.rarity?.toLowerCase();
        const config = RARITY_CONFIG[rarity];
        const maxLevel = config ? config.maxLevel : 16;
        setTargetLevel(maxLevel);
        // Scroll to the interactive container so card detail is visible, accounting for fixed navbar height
        setTimeout(() => {
            if (interactiveRef.current) {
                const elementPosition = interactiveRef.current.getBoundingClientRect().top + window.scrollY;
                const offset = 96; // 80px navbar height + 16px buffer
                window.scrollTo({
                    top: elementPosition - offset,
                    behavior: 'smooth'
                });
            }
        }, 50);
    }, []);

    const backToList = useCallback(() => {
        setSelectedEntry(null);
        setCurrentLevel(null);
        setTargetLevel(null);
    }, []);

    const resolveImage = (card) => {
        const enriched = allCards?.find(c => c.id === card.id);
        if (enriched) return enriched.imageUri || card.iconUrls?.medium || null;
        return card.iconUrls?.medium || null;
    };

    const getRarityColor = (rarity) => RARITY_DISPLAY[rarity?.toLowerCase()]?.color || '#9f8b9d';

    // ── Static cost data ──
    const staticCosts = useMemo(() => {
        return Object.entries(RARITY_CONFIG).map(([key, config]) => {
            const totalCards = config.upgradeMaterials.reduce((sum, n) => sum + n, 0);
            const totalGold = config.upgradeCosts.reduce((sum, n) => sum + n, 0);
            const estGems = Math.ceil(totalCards * (config.gemsPerCard || 0));
            const display = RARITY_DISPLAY[key];
            return {
                key,
                label: display?.label || key,
                color: display?.color || '#999',
                startLevel: config.startLevel,
                maxLevel: config.maxLevel,
                totalCards,
                totalGold,
                estGems,
            };
        });
    }, []);

    return (
        <div className="calc-page">
            <div className="calc-layout-container">
                {/* ═══ Sidebar (Player search + Static Cost Table) ═══ */}
                <div className="calc-sidebar">
                    <div className="calc-sidebar-header">
                        <span className="material-symbols-outlined calc-header-icon">calculate</span>
                        <h1>Clash Royale Card Upgrade Calculator</h1>
                    </div>
                    <p className="calc-sidebar-desc">
                        Calculate the exact Gold, Cards, and Gems you need to max your Clash Royale cards. Enter your player tag to scan your profile and calculate custom upgrade requirements.
                    </p>

                    {/* Search Bar */}
                    <div className="calc-search-box">
                        <div className="calc-search-input-wrap">
                            <span className="material-symbols-outlined input-icon">tag</span>
                            <input
                                className="calc-search-input-field"
                                type="text"
                                placeholder="Player Tag (e.g. J08CVRJ00)"
                                value={playerTag}
                                onChange={(e) => setPlayerTag(e.target.value.toUpperCase().replace(/#/g, ''))}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <button
                            className="calc-search-action-btn"
                            onClick={handleSearch}
                            disabled={loading || !playerTag.trim()}
                        >
                            {loading ? '...' : 'Search'}
                        </button>
                    </div>

                    {/* Search Error */}
                    {error && <div className="calc-search-error">{error}</div>}

                    {/* Results Badge */}
                    {cards && playerName && (
                        <div className="player-badge">
                            <div className="player-badge-info">
                                <span className="player-badge-label">Active Profile</span>
                                <span className="player-badge-name">
                                    {playerName} <span className="player-badge-tag">#{playerTag}</span>
                                </span>
                            </div>
                            <button className="player-badge-clear-btn" onClick={handleClearPlayer} title="Clear player search">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    )}

                    {/* ═══ Static Cost Table (SEO critical, collapsible on mobile) ═══ */}
                    <div className="calc-static-costs">
                        <button
                            className="calc-static-costs-toggle"
                            onClick={() => setRarityTableOpen(prev => !prev)}
                        >
                            <h3>Clash Royale Upgrade Gold & Cards Cost Table</h3>
                            <span className={`material-symbols-outlined toggle-chevron ${rarityTableOpen ? 'open' : ''}`}>expand_more</span>
                        </button>
                        <div className={`calc-static-costs-body ${rarityTableOpen ? 'expanded' : ''}`}>
                            <div className="calc-cost-table-wrap">
                                <table className="calc-cost-table">
                                    <thead>
                                        <tr>
                                            <th>Rarity</th>
                                            <th>Levels</th>
                                            <th>Cards</th>
                                            <th>Gold</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {staticCosts.map(row => (
                                            <tr key={row.key}>
                                                <td className="rarity-cell" style={{ color: row.color }}>
                                                    {row.label}
                                                </td>
                                                <td>{row.startLevel}→{row.maxLevel}</td>
                                                <td>{row.totalCards.toLocaleString()}</td>
                                                <td>{row.totalGold.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══ Main Area (Grid / Detail Panel) ═══ */}
                <div className="calc-main">
                    <div className="calc-interactive-container" ref={interactiveRef}>
                        <div className="calc-interactive-header">
                            <h2>
                                {selectedEntry ? selectedEntry.card.name : (cards ? `${playerName}'s Collection` : 'All Royale Cards')}
                            </h2>
                            {selectedEntry && (
                                <button className="calc-detail-back" onClick={backToList}>
                                    <span className="material-symbols-outlined">arrow_back</span>
                                    Back to list
                                </button>
                            )}
                        </div>

                        <div className="calc-interactive-body">
                            {!selectedEntry ? (
                                <>
                                    {/* Card Controls */}
                                    <div className="calc-controls">
                                        {/* Card Search (shown first for mobile) */}
                                        <div className="calc-modal-search">
                                            <div className="calc-modal-search-wrap">
                                                <span className="material-symbols-outlined">search</span>
                                                <input
                                                    className="calc-modal-search-input"
                                                    type="text"
                                                    placeholder="Search by card name..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Rarity Filters */}
                                        <div className="calc-modal-filters">
                                            {['all', 'common', 'rare', 'epic', 'legendary', 'champion'].map(key => (
                                                <button
                                                    key={key}
                                                    className={`calc-filter-tab ${rarityFilter === key ? 'active' : ''}`}
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
                                                        <span className="filter-count">
                                                            ({rarityCounts[key]})
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Card Grid */}
                                    {allCards ? (
                                        <div className="calc-modal-grid">
                                            {filteredCards.map((entry) => {
                                                const { card, absoluteLevel, progression } = entry;
                                                const rarity = card.rarity?.toLowerCase();
                                                const rarityColor = getRarityColor(rarity);
                                                const imgSrc = resolveImage(card);

                                                return (
                                                    <div
                                                        key={card.id}
                                                        className="calc-card-tile"
                                                        style={{ borderColor: `${rarityColor}33` }}
                                                        onClick={() => openDetail(entry)}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.borderColor = `${rarityColor}88`;
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.borderColor = `${rarityColor}33`;
                                                        }}
                                                    >
                                                        <div className="calc-card-tile-img-wrap">
                                                            {imgSrc ? (
                                                                <img src={imgSrc} alt={card.name} loading="lazy" />
                                                            ) : (
                                                                <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
                                                                    <span className="material-symbols-outlined text-outline">help</span>
                                                                </div>
                                                            )}
                                                            <div className="calc-card-tile-overlay">
                                                                <span className="calc-card-tile-name">{card.name}</span>
                                                                <span className="calc-card-tile-level" style={{ color: rarityColor }}>
                                                                    Lv. {absoluteLevel}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="calc-progress-bar-wrap">
                                                            <div className="calc-progress-bar-track">
                                                                <div
                                                                    className="calc-progress-bar-fill"
                                                                    style={{
                                                                        width: `${progression.percentage}%`,
                                                                        background: `linear-gradient(90deg, ${rarityColor}88, ${rarityColor})`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="calc-progress-label">
                                                                <span className="calc-progress-pct" style={{ color: rarityColor }}>
                                                                    {progression.percentage.toFixed(0)}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="calc-cards-loading">
                                            <div className="spinner"></div>
                                            <p>Loading card database...</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* ═══ DETAIL VIEW ═══ */
                                <div className="calc-detail-panel">
                                    {detailData && (
                                        <>
                                            {/* Card Header */}
                                            <div className="calc-detail-header">
                                                {resolveImage(selectedEntry.card) && (
                                                    <div 
                                                        className="calc-detail-img-wrap"
                                                        style={{ borderColor: getRarityColor(detailData.rarity) }}
                                                    >
                                                        <img
                                                            className="calc-detail-img"
                                                            src={resolveImage(selectedEntry.card)}
                                                            alt={selectedEntry.card.name}
                                                        />
                                                    </div>
                                                )}
                                                <div className="calc-detail-info">
                                                    <h4>{selectedEntry.card.name}</h4>
                                                    <p className="calc-detail-meta">
                                                        <span style={{ color: getRarityColor(detailData.rarity), fontWeight: 700 }}>
                                                            {RARITY_DISPLAY[detailData.rarity]?.label}
                                                        </span>
                                                        {selectedEntry.card.elixirCost != null && (
                                                            <span> · {selectedEntry.card.elixirCost} Elixir</span>
                                                        )}
                                                    </p>
                                                    <div
                                                        className="calc-detail-level-badge"
                                                        style={{ borderLeft: `3px solid ${getRarityColor(detailData.rarity)}` }}
                                                    >
                                                        Level {detailData.absoluteLevel} / {detailData.maxLevel}
                                                    </div>
                                                    <p className="calc-detail-meta" style={{ marginTop: '0.375rem' }}>
                                                        Cards owned: <strong style={{ color: 'white' }}>{(selectedEntry.card.count || 0).toLocaleString()}</strong>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Levels Selectors Wrap */}
                                            <div className="calc-selectors-grid">
                                                {/* Current Level Selector */}
                                                <div className="calc-target-selector">
                                                    <p className="calc-target-label">Current Level</p>
                                                    {cards ? (
                                                        <div className="calc-level-static-badge">
                                                            Level {detailData.originalLevel} <span className="badge-note">(Profile Level)</span>
                                                        </div>
                                                    ) : (
                                                        <div className="calc-target-buttons flex-wrap">
                                                            {Array.from(
                                                                { length: detailData.maxLevel - detailData.config.startLevel },
                                                                (_, i) => detailData.config.startLevel + i
                                                            ).map(lvl => (
                                                                <button
                                                                    key={lvl}
                                                                    className={`calc-target-btn ${(currentLevel !== null ? currentLevel : detailData.originalLevel) === lvl ? 'active' : ''}`}
                                                                    onClick={() => {
                                                                        setCurrentLevel(lvl);
                                                                        // Auto-increase target level if it becomes less than or equal to current level
                                                                        const currentTarget = targetLevel !== null ? targetLevel : detailData.maxLevel;
                                                                        if (currentTarget <= lvl) {
                                                                            setTargetLevel(Math.min(lvl + 1, detailData.maxLevel));
                                                                        }
                                                                    }}
                                                                >
                                                                    {lvl}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Target Level Selector */}
                                                <div className="calc-target-selector">
                                                    <p className="calc-target-label">Target Level</p>
                                                    <div className="calc-target-buttons flex-wrap">
                                                        {Array.from(
                                                            { length: detailData.maxLevel - (currentLevel !== null ? currentLevel : detailData.originalLevel) },
                                                            (_, i) => (currentLevel !== null ? currentLevel : detailData.originalLevel) + i + 1
                                                        ).map(lvl => (
                                                            <button
                                                                key={lvl}
                                                                className={`calc-target-btn ${(targetLevel !== null ? targetLevel : detailData.maxLevel) === lvl ? 'active' : ''}`}
                                                                onClick={() => setTargetLevel(lvl)}
                                                            >
                                                                {lvl}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Resource Summary */}
                                            <ResourceSummary result={detailData.result} rarity={detailData.rarity} />

                                            {/* Steps Table */}
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
                </div>
            </div>

            {/* ═══ Unified FAQ Section at Bottom ═══ */}
            <div className="calc-faq-wrapper">
                <FaqSection defaultCategory="calculator" />
            </div>
        </div>
    );
};

// ── Sub-Components (reused from CardUpgradeModal pattern) ──

const ResourceSummary = ({ result, rarity }) => {
    const rarityColor = RARITY_DISPLAY[rarity]?.color || '#9f8b9d';
    return (
        <div className="calc-resource-grid">
            <div className="calc-resource-card">
                <div className="glow" style={{ background: rarityColor }} />
                <span className="calc-resource-label">Cards Needed</span>
                <span className="calc-resource-value" style={{ color: rarityColor }}>
                    {result.totalCardsNeeded.toLocaleString()}
                </span>
                <span className="calc-resource-sub">Owned: {result.cardsFromOwned.toLocaleString()}</span>
            </div>
            <div className="calc-resource-card">
                <div className="glow" style={{ background: result.missingCards > 0 ? 'var(--color-error)' : '#4ade80' }} />
                <span className="calc-resource-label">Missing Cards</span>
                <span className="calc-resource-value" style={{ color: result.missingCards > 0 ? 'var(--color-error)' : '#4ade80' }}>
                    {result.missingCards > 0 ? result.missingCards.toLocaleString() : '✓'}
                </span>
                <span className="calc-resource-sub">{result.missingCards > 0 ? 'Still needed' : 'All covered'}</span>
            </div>
            <div className="calc-resource-card">
                <div className="glow" style={{ background: 'var(--color-secondary)' }} />
                <span className="calc-resource-label">Gold Required</span>
                <span className="calc-resource-value" style={{ color: 'var(--color-secondary)' }}>
                    {result.totalGoldNeeded.toLocaleString()}
                </span>
                <span className="calc-resource-sub">For all upgrades</span>
            </div>
            <div className="calc-resource-card">
                <div className="glow" style={{ background: '#4ade80' }} />
                <span className="calc-resource-label">Est. Gems</span>
                <span className="calc-resource-value" style={{ color: '#4ade80' }}>
                    {result.estimatedGems > 0 ? `~${result.estimatedGems.toLocaleString()}` : '—'}
                </span>
                <span className="calc-resource-sub">{result.estimatedGems > 0 ? 'For missing cards' : 'No gems needed'}</span>
            </div>
        </div>
    );
};

const StepsTable = ({ steps, rarityColor }) => (
    <div className="calc-steps-table-section">
        <p
            className="text-xs uppercase tracking-[0.15em] font-black mb-3"
            style={{ color: 'var(--color-on-surface-variant)' }}
        >
            Level-by-Level Breakdown
        </p>
        <div className="calc-steps-table-wrap">
            <table className="calc-steps-table">
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
                            <td>{step.cardsNeeded > 0 ? step.cardsNeeded.toLocaleString() : '—'}</td>
                            <td>{step.goldNeeded > 0 ? step.goldNeeded.toLocaleString() : '—'}</td>
                            <td>
                                {step.affordable ? (
                                    <span className="calc-step-affordable">✓ Ready</span>
                                ) : (
                                    <span className="calc-step-missing">−{step.deficit.toLocaleString()}</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default CardUpgradeCalculatorPage;
