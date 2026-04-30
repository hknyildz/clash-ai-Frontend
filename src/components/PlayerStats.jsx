import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchPlayerStats, fetchAllCards } from '../services/api';
import './PlayerStats.css';

// Parse "MasteryBabyDragon" → "Baby Dragon"
const parseMasteryName = (badgeName) => {
    const withoutPrefix = badgeName.replace(/^Mastery/, '');
    return withoutPrefix.replace(/([A-Z])/g, ' $1').trim();
};

// Override map for mastery badge names that don't match card names after CamelCase parsing.
// Add new entries here when you find mismatches:
const MASTERY_NAME_OVERRIDES = {
    'Barb Log': 'Barbarian Barrel',
    'Ice Spirits': 'Ice Spirit',
    'Archer': 'Archers',
    'Elite Archer': 'Magic Archer',
    'Wallbreakers': 'Wall Breakers',
    'Log': 'The Log',
    'Pekka': 'P.E.K.K.A'
};

const WinRateRing = ({ winRate }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (winRate / 100) * circumference;
    const color = winRate >= 55 ? '#4ade80' : winRate >= 45 ? 'var(--color-primary)' : 'var(--color-error)';

    return (
        <div className="winrate-ring">
            <svg width="140" height="140" viewBox="0 0 140 140">
                <circle className="winrate-ring-bg" cx="70" cy="70" r={radius} />
                <circle
                    className="winrate-ring-fill"
                    cx="70" cy="70" r={radius}
                    stroke={color}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <div className="winrate-ring-center">
                <span className="winrate-percent" style={{ color }}>{winRate.toFixed(1)}%</span>
                <span className="winrate-label">Win Rate</span>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, sub, color = 'var(--color-primary)', glowColor }) => (
    <motion.div
        className="stat-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
    >
        <div className="stat-card-glow" style={{ background: glowColor || color }} />
        <span className="stat-card-label">{label}</span>
        <span className="stat-card-value" style={{ color }}>{value}</span>
        {sub && <span className="stat-card-sub">{sub}</span>}
    </motion.div>
);

const PlayerStats = ({ playerTag }) => {
    const [statsData, setStatsData] = useState(null);
    const [allCards, setAllCards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasFetched, setHasFetched] = useState(false);

    const fetchStats = async () => {
        if (!playerTag || !playerTag.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const [stats, cards] = await Promise.all([
                fetchPlayerStats(playerTag),
                fetchAllCards()
            ]);
            if (!stats || typeof stats !== 'object' || Object.keys(stats).length === 0) {
                throw new Error("Player not found. Please check your player tag.");
            }
            setStatsData(stats);
            setAllCards(cards);
            setHasFetched(true);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to fetch player stats. Check the player tag.');
        } finally {
            setLoading(false);
        }
    };

    // Reset when tag changes
    useEffect(() => {
        setHasFetched(false);
        setStatsData(null);
        setError(null);
    }, [playerTag]);

    if (!playerTag || !playerTag.trim()) {
        return (
            <div className="stats-container">
                <div className="stats-loading">
                    <span className="material-symbols-outlined text-5xl text-outline mb-4">person_search</span>
                    <h3 className="text-xl font-headline font-bold text-on-surface-variant mb-2">Enter a Player Tag</h3>
                    <p className="text-sm text-outline">Type your player tag above to view statistics.</p>
                </div>
            </div>
        );
    }

    if (!hasFetched && !loading) {
        return (
            <div className="stats-container">
                <div className="stats-loading">
                    <span className="material-symbols-outlined text-5xl text-primary mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>query_stats</span>
                    <h3 className="text-xl font-headline font-bold text-on-surface mb-2">Ready to Analyze</h3>
                    <p className="text-sm text-on-surface-variant mb-6 max-w-md">Reveal your battle history, mastery progression, and player profile.</p>
                    <button
                        onClick={fetchStats}
                        className="flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-full font-headline font-black uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(251,171,255,0.3)] hover:shadow-[0_0_30px_rgba(251,171,255,0.6)] transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                        View Stats
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="stats-container">
                <div className="stats-loading">
                    <div className="relative w-20 h-20 mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-surface-container-highest" />
                        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-2xl animate-pulse">query_stats</span>
                        </div>
                    </div>
                    <h3 className="text-lg font-headline font-bold text-white tracking-widest uppercase">Analyzing...</h3>
                    <p className="text-sm text-on-surface-variant mt-1">Crunching your battle data 📊</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="stats-container">
                <div className="glass-panel rounded-lg p-4 border border-error/30 text-error">{error}</div>
            </div>
        );
    }

    if (!statsData) return null;

    // Computed values
    const wins = statsData.wins || 0;
    const losses = statsData.losses || 0;
    const totalWL = wins + losses;
    const winRate = totalWL > 0 ? (wins / totalWL) * 100 : 0;
    const draws = (statsData.battleCount || 0) - totalWL;
    const threeCrownRate = totalWL > 0 ? ((statsData.threeCrownWins || 0) / totalWL * 100) : 0;
    const streak = statsData.currentWinLoseStreak || 0;

    // Years played badge
    const yearsPlayed = statsData.badges?.find(b => b.name === 'YearsPlayed');

    // Top 10 Mastery cards
    const masteryBadges = (statsData.badges || [])
        .filter(b => b.name && b.name.startsWith('Mastery'))
        .sort((a, b) => (b.level || 0) - (a.level || 0))
        .slice(0, 10);

    // Match mastery badges with card images
    const masteryCards = masteryBadges.map(badge => {
        const rawName = parseMasteryName(badge.name);
        const cardName = MASTERY_NAME_OVERRIDES[rawName] || rawName;
        const matchedCard = allCards.find(c => c.name && c.name.toLowerCase() === cardName.toLowerCase());
        return {
            name: cardName,
            level: badge.level,
            maxLevel: badge.maxLevel,
            imageUrl: matchedCard?.imageUri || matchedCard?.imageUriEvolved || null,
            badgeIconUrl: badge.iconUrls?.large || null
        };
    });

    const favCard = statsData.currentFavouriteCard;

    return (
        <div className="stats-container">
            {/* Player Header */}
            <motion.div
                className="player-header"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <div className="player-avatar">
                    {statsData.name ? statsData.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="player-info">
                    <h2 className="font-headline text-white">{statsData.name || 'Unknown'}</h2>
                    <p className="player-tag-display">{statsData.tag}</p>
                    {statsData.clan && (
                        <p className="text-xs text-secondary font-bold mt-0.5">
                            <span className="material-symbols-outlined text-xs align-middle mr-0.5">shield</span>
                            {statsData.clan.name}
                            {statsData.role && <span className="text-outline ml-1">· {statsData.role}</span>}
                        </p>
                    )}
                </div>
            </motion.div>

            {/* Main Grid: Stats + Win Rate */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                {/* Battle Stats */}
                <div className="lg:col-span-8">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
                        <h3 className="text-xs uppercase tracking-[0.2em] font-black text-tertiary">Battle Stats</h3>
                    </div>
                    <div className="stat-cards-grid">
                        <StatCard label="Trophies" value={statsData.trophies || '0'} sub={`Best: ${statsData.bestTrophies || 0}`} color="var(--color-secondary)" />
                        <StatCard label="Wins" value={wins.toLocaleString()} color="#4ade80" />
                        <StatCard label="Losses" value={losses.toLocaleString()} color="var(--color-error)" />
                        <StatCard label="Battles" value={(statsData.battleCount || 0).toLocaleString()} sub={`Draws: ${draws}`} color="var(--color-tertiary)" />
                        <StatCard label="3-Crown Wins" value={(statsData.threeCrownWins || 0).toLocaleString()} sub={`${threeCrownRate.toFixed(1)}% of wins`} color="var(--color-secondary)" />
                        <StatCard
                            label="Win Streak"
                            value={streak > 0 ? `+${streak}` : streak === 0 ? '0' : `${streak}`}
                            sub={streak > 0 ? 'On fire!' : streak < 0 ? 'Rough patch' : 'Neutral'}
                            color={streak > 0 ? '#4ade80' : streak < 0 ? 'var(--color-error)' : 'var(--color-outline)'}
                        />
                        <StatCard label="Donations" value={(statsData.totalDonations || 0).toLocaleString()} color="var(--color-tertiary)" />
                        <StatCard label="War Wins" value={(statsData.warDayWins || 0).toLocaleString()} color="var(--color-primary)" />
                    </div>
                </div>

                {/* Win Rate Ring */}
                <div className="lg:col-span-4">
                    <div className="glass-panel rounded-lg border border-outline-variant/20 p-6 h-full flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 blur-3xl" />
                        <WinRateRing winRate={winRate} />
                        <div className="mt-4 text-center">
                            <p className="text-sm text-on-surface-variant">
                                <span className="text-white font-bold">{wins}</span> W — <span className="text-white font-bold">{losses}</span> L
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Favourite Card + Years + Mastery */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Favourite Card */}
                {favCard && (
                    <motion.div
                        className="glass-panel rounded-lg border border-outline-variant/20 overflow-hidden"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="px-4 pt-4">
                            <h3 className="text-xs uppercase tracking-[0.2em] font-black text-tertiary mb-0">Your Current Favourite</h3>
                        </div>
                        <div className="fav-card-container">
                            {favCard.iconUrls?.medium && (
                                <img className="fav-card-img" src={favCard.iconUrls.medium} alt={favCard.name} />
                            )}
                            <div className="fav-card-info">
                                <p className="text-lg font-bold text-white font-headline">{favCard.name}</p>
                                <p className="text-xs text-on-surface-variant capitalize">{favCard.rarity} · {favCard.elixirCost} Elixir</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Years Playing */}
                {yearsPlayed && (
                    <motion.div
                        className="glass-panel rounded-lg border border-outline-variant/20 overflow-hidden"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="px-4 pt-4">
                            <h3 className="text-xs uppercase tracking-[0.2em] font-black text-tertiary mb-0">Veteran Status</h3>
                        </div>
                        <div className="years-badge">
                            {yearsPlayed.iconUrls?.large && (
                                <img className="years-badge-icon" src={yearsPlayed.iconUrls.large} alt="Years Played" />
                            )}
                            <div>
                                <p className="text-lg font-bold text-white font-headline">
                                    {yearsPlayed.level}+ Years
                                </p>
                                <p className="text-xs text-on-surface-variant">
                                    You've been clashing for over {yearsPlayed.level} years! 🏆
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Clan */}
                {statsData.clan && (
                    <motion.div
                        className="glass-panel rounded-lg border border-outline-variant/20 overflow-hidden"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="px-4 pt-4">
                            <h3 className="text-xs uppercase tracking-[0.2em] font-black text-tertiary mb-0">Clan</h3>
                        </div>
                        <div className="clan-info">
                            <div className="clan-badge">
                                <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-white font-headline">{statsData.clan.name}</p>
                                <p className="text-xs text-on-surface-variant">
                                    {statsData.clan.tag}
                                    {statsData.role && <span className="ml-1">· <span className="text-secondary capitalize">{statsData.role}</span></span>}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Top Mastery Cards */}
            {masteryCards.length > 0 && (
                <motion.div
                    className="mt-6"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                        <h3 className="text-xs uppercase tracking-[0.2em] font-black text-tertiary">Top Mastery Cards</h3>
                        <span className="text-[10px] text-outline uppercase tracking-widest ml-auto">By mastery level</span>
                    </div>
                    <div className="mastery-grid">
                        {masteryCards.map((card, i) => (
                            <motion.div
                                key={card.name}
                                className="mastery-card"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 + i * 0.05 }}
                                style={{
                                    borderColor: card.level >= 8 ? 'var(--color-secondary)' : card.level >= 5 ? 'var(--color-primary)' : undefined
                                }}
                            >
                                {card.imageUrl ? (
                                    <img src={card.imageUrl} alt={card.name} />
                                ) : card.badgeIconUrl ? (
                                    <img src={card.badgeIconUrl} alt={card.name} />
                                ) : (
                                    <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
                                        <span className="material-symbols-outlined text-outline">help</span>
                                    </div>
                                )}
                                <div className="mastery-card-overlay">
                                    <span className="mastery-card-name">{card.name}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default PlayerStats;
