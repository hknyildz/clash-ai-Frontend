import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchBattleLog } from '../services/api';
import './BattleLog.css';

const formatBattleTime = (timeStr) => {
    if (!timeStr) return '';
    // "20260430T014045.000Z" → Date
    const y = timeStr.slice(0, 4);
    const m = timeStr.slice(4, 6);
    const d = timeStr.slice(6, 8);
    const h = timeStr.slice(9, 11);
    const min = timeStr.slice(11, 13);
    return `${d}/${m}/${y} ${h}:${min}`;
};

const BattleCard = ({ battle, playerTag, onNavigateToPlayer }) => {
    const [expanded, setExpanded] = useState(false);

    const team = battle.team?.[0];
    const opponent = battle.opponent?.[0];
    if (!team || !opponent) return null;

    const trophyChange = team.trophyChange || 0;
    const crownChange = team.crowns - opponent.crowns;
    const isWin = crownChange > 0;
    const isDraw = crownChange === 0;
    const resultLabel = isWin ? 'Victory' : isDraw ? 'Draw' : 'Defeat';
    const resultClass = isWin ? 'win' : isDraw ? 'draw' : 'loss';

    const handleCopyDeck = (cards, e) => {
        e.stopPropagation();
        const cardIds = cards.map(c => c.id).join(';');
        const url = `https://link.clashroyale.com/en/?clashroyale://copyDeck?deck=${cardIds}&l=Royals`;
        window.open(url, '_blank');
    };

    const getNormalizedLevel = (card) => {
        if (!card.level) return null;
        let rawLevel = card.level;
        if (card.rarity) {
            switch (card.rarity.toLowerCase()) {
                case 'rare': return rawLevel + 2;
                case 'epic': return rawLevel + 5;
                case 'legendary': return rawLevel + 8;
                case 'champion': return rawLevel + 10;
                default: return rawLevel;
            }
        }
        return rawLevel;
    };

    const getAvgElixir = (cards) => {
        if (!cards || cards.length === 0) return 0;
        const total = cards.reduce((sum, c) => sum + (c.elixirCost || 0), 0);
        return (total / cards.length).toFixed(1);
    };

    const renderDeck = (cards) => {
        const sortedCards = [...(cards || [])];

        return (
            <div className="battle-deck-grid">
                {sortedCards.map((card, i) => {
                    const isEvo = card.evolutionLevel === 1;
                    const isHero = card.evolutionLevel === 2;
                    const imgSrc = isEvo && card.iconUrls?.evolutionMedium
                        ? card.iconUrls.evolutionMedium
                        : (isHero && card.iconUrls?.heroMedium ? card.iconUrls.heroMedium : card.iconUrls?.medium);

                    return (
                        <div key={card.id || i} className={`battle-deck-card ${isEvo ? 'ring-1 ring-primary' : ''} ${isHero && !isEvo ? 'ring-1 ring-secondary' : ''}`}>
                            {imgSrc && (
                                <img src={imgSrc} alt={card.name} />
                            )}
                            <div className="battle-deck-card-overlay">
                                <span className="battle-deck-card-name">{card.name}</span>
                            </div>
                            {card.level && (
                                <span className="battle-deck-card-level">L{getNormalizedLevel(card)}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderMiniDeck = (cards) => {
        const sortedCards = [...(cards || [])];

        return (
            <div className="flex items-center gap-1 mt-2">
                {sortedCards.map((card, i) => {
                    const isEvo = card.evolutionLevel === 1;
                    const isHero = card.evolutionLevel === 2;
                    const imgSrc = isEvo && card.iconUrls?.evolutionMedium
                        ? card.iconUrls.evolutionMedium
                        : (isHero && card.iconUrls?.heroMedium ? card.iconUrls.heroMedium : card.iconUrls?.medium);
                    return (
                        <div key={card.id || i} className={`w-8 h-12 sm:w-10 sm:h-[60px] rounded-sm overflow-hidden bg-surface-container-highest ${isEvo ? 'ring-1 ring-primary' : ''} ${isHero && !isEvo ? 'ring-1 ring-secondary' : ''}`}>
                            {imgSrc && <img src={imgSrc} alt={card.name} className="w-full h-full object-cover" />}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderPlayerProfile = (player, isOpponent) => (
        <div className={`flex flex-col gap-1 ${isOpponent ? 'items-end text-right' : 'items-start text-left'}`}>
            <div
                className={`flex items-center gap-2 group cursor-pointer ${isOpponent ? 'flex-row-reverse' : 'flex-row'}`}
                onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToPlayer?.(player.tag);
                }}
            >
                <div className={`w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 flex items-center justify-center text-lg font-black text-white shadow-lg group-hover:scale-110 transition-transform border border-white/10 group-hover:border-primary/50`}>
                    {player.name ? player.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className={`flex flex-col ${isOpponent ? 'items-end' : 'items-start'}`}>
                    <span className={`font-headline font-bold text-sm text-white group-hover:text-primary transition-colors flex items-center gap-1 leading-tight`}>
                        {isOpponent && <span className="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-100 transition-opacity text-primary">open_in_new</span>}
                        {player.name}
                        {!isOpponent && <span className="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-100 transition-opacity text-primary">open_in_new</span>}
                    </span>
                    <span className="text-[10px] text-outline font-mono">
                        {player.tag}
                    </span>
                    {player.clan && (
                        <span className="text-[9px] text-secondary font-bold mt-0.5 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[10px] font-variation-fill">shield</span>
                            {player.clan.name}
                        </span>
                    )}
                </div>
            </div>
            {renderMiniDeck(player.cards)}
        </div>
    );

    return (
        <motion.div
            className={`battle-card ${expanded ? 'expanded' : ''}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            layout
        >
            {/* Collapsed Summary */}
            <div className="battle-summary" onClick={() => setExpanded(!expanded)}>
                {/* Team (left) */}
                <div className="battle-player">
                    {renderPlayerProfile(team, false)}
                </div>

                {/* Center Result */}
                <div className="battle-result">
                    <span className={`battle-result-badge ${resultClass}`}>
                        {resultLabel}
                    </span>
                    <span className={`battle-trophy-change ${trophyChange >= 0 ? 'positive' : 'negative'}`}>
                        {trophyChange > 0 ? '+' : ''}{trophyChange} 🏆
                    </span>
                    <div className="battle-crowns">
                        <span>👑 {team.crowns}</span>
                        <span style={{ color: 'var(--color-outline)' }}>vs</span>
                        <span>👑 {opponent.crowns}</span>
                    </div>
                    <span className="battle-meta">
                        {battle.gameMode?.name || 'Battle'}
                    </span>
                    <span className={`material-symbols-outlined battle-expand-icon ${expanded ? 'rotated' : ''}`} style={{ fontSize: '1rem', color: 'var(--color-outline)' }}>
                        expand_more
                    </span>
                </div>

                {/* Opponent (right) */}
                <div className="battle-player right">
                    {renderPlayerProfile(opponent, true)}
                </div>
            </div>

            {/* Expanded Detail */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        className="battle-detail"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="battle-detail-grid">
                            {/* Team Deck */}
                            <div className="battle-detail-side">
                                <div className="battle-detail-side-header flex justify-between items-center w-full">
                                    <div className="flex items-center gap-2">
                                        <span className="battle-detail-label">{team.name}'s Deck</span>
                                        <span className="text-[10px] text-tertiary font-bold flex items-center gap-0.5 bg-tertiary/10 px-1.5 py-0.5 rounded border border-tertiary/20">
                                            <span className="material-symbols-outlined font-variation-fill" style={{ fontSize: '12px' }}>water_drop</span>
                                            {getAvgElixir(team.cards)}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={(e) => handleCopyDeck(team.cards, e)}
                                        className="text-[10px] uppercase font-bold tracking-wider bg-primary/20 text-primary hover:bg-primary hover:text-on-primary px-3 py-1.5 rounded transition-colors flex items-center gap-1 border border-primary/30 hover:border-primary"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>content_copy</span>
                                        Copy
                                    </button>
                                </div>
                                {renderDeck(team.cards)}
                                <div className="battle-stats-row">
                                    <div className="battle-stat-chip">
                                        <span className="battle-stat-chip-label">Crowns</span>
                                        <span className="battle-stat-chip-value">{team.crowns}</span>
                                    </div>
                                    <div className="battle-stat-chip">
                                        <span className="battle-stat-chip-label">King HP</span>
                                        <span className="battle-stat-chip-value">{team.kingTowerHitPoints || '—'}</span>
                                    </div>
                                    {team.princessTowersHitPoints && (
                                        <div className="battle-stat-chip">
                                            <span className="battle-stat-chip-label">Princess HP</span>
                                            <span className="battle-stat-chip-value">{team.princessTowersHitPoints.join(' / ')}</span>
                                        </div>
                                    )}
                                    {team.elixirLeaked != null && (
                                        <div className="battle-stat-chip">
                                            <span className="battle-stat-chip-label">Elixir Leaked</span>
                                            <span className="battle-stat-chip-value">{team.elixirLeaked.toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Opponent Deck */}
                            <div className="battle-detail-side">
                                <div className="battle-detail-side-header flex justify-between items-center w-full">
                                    <div className="flex items-center gap-2">
                                        <span className="battle-detail-label">{opponent.name}'s Deck</span>
                                        <span className="text-[10px] text-tertiary font-bold flex items-center gap-0.5 bg-tertiary/10 px-1.5 py-0.5 rounded border border-tertiary/20">
                                            <span className="material-symbols-outlined font-variation-fill" style={{ fontSize: '12px' }}>water_drop</span>
                                            {getAvgElixir(opponent.cards)}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={(e) => handleCopyDeck(opponent.cards, e)}
                                        className="text-[10px] uppercase font-bold tracking-wider bg-primary/20 text-primary hover:bg-primary hover:text-on-primary px-3 py-1.5 rounded transition-colors flex items-center gap-1 border border-primary/30 hover:border-primary"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>content_copy</span>
                                        Copy
                                    </button>
                                </div>
                                {renderDeck(opponent.cards)}
                                <div className="battle-stats-row">
                                    <div className="battle-stat-chip">
                                        <span className="battle-stat-chip-label">Crowns</span>
                                        <span className="battle-stat-chip-value">{opponent.crowns}</span>
                                    </div>
                                    <div className="battle-stat-chip">
                                        <span className="battle-stat-chip-label">King HP</span>
                                        <span className="battle-stat-chip-value">{opponent.kingTowerHitPoints || '—'}</span>
                                    </div>
                                    {opponent.princessTowersHitPoints && (
                                        <div className="battle-stat-chip">
                                            <span className="battle-stat-chip-label">Princess HP</span>
                                            <span className="battle-stat-chip-value">{opponent.princessTowersHitPoints.join(' / ')}</span>
                                        </div>
                                    )}
                                    {opponent.elixirLeaked != null && (
                                        <div className="battle-stat-chip">
                                            <span className="battle-stat-chip-label">Elixir Leaked</span>
                                            <span className="battle-stat-chip-value">{opponent.elixirLeaked.toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Battle Info Bar */}
                        <div className="battle-info-bar">
                            <div className="battle-info-item">
                                <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>sports_esports</span>
                                {battle.gameMode?.name || 'Battle'}
                            </div>
                            <div className="battle-info-item">
                                <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>stadium</span>
                                {battle.arena?.name || 'Arena'}
                            </div>
                            <div className="battle-info-item">
                                <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>schedule</span>
                                {formatBattleTime(battle.battleTime)}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const BattleLog = ({ playerTag, onNavigateToPlayer }) => {
    const [battles, setBattles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadBattleLog = async () => {
        if (!playerTag) return;
        setLoading(true);
        setError(null);
        try {
            const data = await fetchBattleLog(playerTag);
            if (Array.isArray(data)) {
                setBattles(data);
            } else {
                setBattles([]);
            }
        } catch (err) {
            setError('Failed to load battle log.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setBattles([]);
        setError(null);
        if (playerTag) {
            loadBattleLog();
        }
    }, [playerTag]);



    if (loading) {
        return (
            <div className="battlelog-container">
                <div className="battlelog-title-row">
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
                    <h3 className="text-xs uppercase tracking-[0.2em] font-black text-tertiary">Battle Log</h3>
                </div>
                <div className="battlelog-loading">
                    <div className="relative w-16 h-16 mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-surface-container-highest" />
                        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    </div>
                    <p className="text-sm text-on-surface-variant">Loading battles...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="battlelog-container">
                <div className="battlelog-title-row">
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
                    <h3 className="text-xs uppercase tracking-[0.2em] font-black text-tertiary">Battle Log</h3>
                </div>
                <div className="glass-panel rounded-lg p-4 border border-error/30 text-error">{error}</div>
            </div>
        );
    }

    return (
        <div className="battlelog-container">
            <div className="battlelog-title-row">
                <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
                <h3 className="text-xs uppercase tracking-[0.2em] font-black text-tertiary">Battle Log</h3>
                <span className="text-[10px] text-outline uppercase tracking-widest ml-auto">{battles.length} battles</span>
            </div>
            {battles.length === 0 ? (
                <p className="text-sm text-outline text-center py-8">No recent battles found.</p>
            ) : (
                battles.map((battle, i) => (
                    <BattleCard
                        key={`${battle.battleTime}-${i}`}
                        battle={battle}
                        playerTag={playerTag}
                        onNavigateToPlayer={onNavigateToPlayer}
                    />
                ))
            )}
        </div>
    );
};

export default BattleLog;
