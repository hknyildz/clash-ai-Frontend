import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchPlayerStats, fetchAllCards } from '../services/api';
import { generateProfileSchema } from '../utils/schemaGenerator';
import BattleLog from './BattleLog';
import TopPlayers from './TopPlayers';
import CardUpgradeSection from './CardUpgradeSection';
import './PlayerStats.css';

// League images for Path of Legends
import league0 from '../assets/leagues/league0.png';
import league1 from '../assets/leagues/league1.png';
import league2 from '../assets/leagues/league2.png';
import league3 from '../assets/leagues/league3.png';
import league4 from '../assets/leagues/league4.png';
import league5 from '../assets/leagues/league5.png';
import league6 from '../assets/leagues/league6.png';
import league7 from '../assets/leagues/league7.png';
import league8 from '../assets/leagues/league8.png';
import league9 from '../assets/leagues/league9.png';
import league10 from '../assets/leagues/league10.png';

const LEAGUE_IMAGES = [league0, league1, league2, league3, league4, league5, league6, league7, league8, league9, league10];

const LEAGUE_NAMES = [
    'Unranked',
    'Challenger I',
    'Challenger II',
    'Challenger III',
    'Master I',
    'Master II',
    'Master III',
    'Champion',
    'Grand Champion',
    'Royal Champion',
    'Ultimate Champion'
];
import { useAuth } from '../contexts/AuthContext';

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
    'Pekka': 'P.E.K.K.A',
    'Blowdart Goblin': 'Dart Goblin',
    'Mini Pekka': 'Mini P.E.K.K.A',
    'Rage Barbarian': 'Lumberjack',
    'Fire Spirits': 'Fire Spirit',
    'Assassin': 'Bandit',
    'Ghost': 'Royal Ghost',
    'Skeleton Balloon': 'Skeleton Barrel',
    'Angry Barbarians': 'Elite Barbarians'
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

const PlayerStats = ({ playerTag, isActive, onNavigateToClan, onNavigateToPlayer }) => {
    const navigate = useNavigate();
    const [localTag, setLocalTag] = useState(playerTag || '');
    const { favorites, addFavorite, removeFavorite } = useAuth();
    const [statsData, setStatsData] = useState(null);
    const [allCards, setAllCards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [imgErrors, setImgErrors] = useState({});

    const isPlayerFavorited = statsData?.tag
        ? favorites.some(f => f.type === 'PLAYER' && f.targetKey === statsData.tag)
        : false;

    const handlePlayerFavoriteToggle = () => {
        if (!statsData?.tag) return;
        if (isPlayerFavorited) {
            removeFavorite('PLAYER', statsData.tag);
        } else {
            addFavorite('PLAYER', statsData.tag, statsData.name || 'Unknown Player', null);
        }
    };

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
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to fetch player stats. Check the player tag.');
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch when tag changes and is active
    useEffect(() => {
        setLocalTag(playerTag || '');
        if (!isActive) return;
        setStatsData(null);
        setError(null);
        if (playerTag && playerTag.trim()) {
            fetchStats();
        }
    }, [playerTag, isActive]);

    const handleSearch = (e) => {
        e.preventDefault();
        const trimmed = localTag.trim().toUpperCase().replace(/#/g, '');
        if (trimmed) {
            navigate(`/player/${trimmed}`);
        }
    };

    const renderSearchBar = () => (
        <div className="mb-8 max-w-xl mx-auto">
            <form onSubmit={handleSearch} className="relative flex items-center p-2 min-h-[64px] rounded-2xl bg-surface-container-lowest border border-outline-variant/30 focus-within:border-primary transition-all duration-300">
                <span className="material-symbols-outlined text-outline ml-3 shrink-0">search</span>
                <input
                    className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-on-surface w-full font-headline font-bold uppercase tracking-wider placeholder:text-outline/50 px-3 py-3 text-base md:text-sm"
                    placeholder="PLAYER TAG (e.g. J08CVRJ00)"
                    type="text"
                    value={localTag}
                    onChange={(e) => setLocalTag(e.target.value.toUpperCase().replace(/#/g, ''))}
                />
                <button
                    type="submit"
                    disabled={loading || !localTag.trim()}
                    className="bg-primary text-on-primary px-5 py-3 rounded-xl font-headline font-black uppercase text-xs tracking-tighter hover:bg-primary-container transition-colors disabled:opacity-50 shrink-0"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>
        </div>
    );

    if (!playerTag || !playerTag.trim()) {
        return (
            <div className="stats-container">
                {renderSearchBar()}
                <TopPlayers onNavigateToPlayer={(tag) => navigate(`/player/${tag.replace(/#/g, '')}`)} />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="stats-container">
                {renderSearchBar()}
                <div className="stats-loading mt-12">
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
                {renderSearchBar()}
                <div className="glass-panel rounded-lg p-4 border border-error/30 text-error mt-8">{error}</div>
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
            imageUrl: matchedCard?.imageUriHero || matchedCard?.imageUriEvolved || matchedCard?.imageUri || null,
            baseImageUrl: matchedCard?.imageUri || null,
            isHero: matchedCard?.isHero || false,
            badgeIconUrl: badge.iconUrls?.large || null
        };
    });

    const profileSchema = generateProfileSchema(statsData);
    const favCard = statsData.currentFavouriteCard;

    return (
        <div className="stats-container">
            {profileSchema && (
                <Helmet>
                    <script type="application/ld+json">
                        {JSON.stringify(profileSchema)}
                    </script>
                </Helmet>
            )}
            {renderSearchBar()}

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
                    <div className="flex items-center gap-2">
                        <h2 className="font-headline text-white">{statsData.name || 'Unknown'}</h2>
                        <button
                            onClick={handlePlayerFavoriteToggle}
                            className={`px-1.5 pt-1.5 rounded-full transition-all active:scale-95 border ${isPlayerFavorited
                                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                : 'bg-white/5 hover:bg-white/10 text-outline hover:text-rose-400 border border-white/10 hover:border-rose-500/30'
                                }`}
                            title={isPlayerFavorited ? "Remove Player from Saved" : "Save Player"}
                        >
                            <span className="material-symbols-outlined text-sm sm:text-base leading-none" style={{ fontVariationSettings: isPlayerFavorited ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                        </button>
                    </div>
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
                            <h3 className="text-xs uppercase tracking-[0.2em] font-black text-tertiary mb-0">Current Favourite</h3>
                        </div>
                        <div className="fav-card-container">
                            {favCard.iconUrls?.medium && (
                                <div className="relative">
                                    <img
                                        className="fav-card-img"
                                        src={imgErrors['fav'] ? favCard.iconUrls.medium : (allCards.find(c => c.id === favCard.id)?.imageUriHero || favCard.iconUrls.medium)}
                                        alt={favCard.name}
                                        onError={() => !imgErrors['fav'] && setImgErrors(prev => ({ ...prev, fav: true }))}
                                    />
                                    {allCards.find(c => c.id === favCard.id)?.isHero && imgErrors['fav'] && (
                                        <div className="absolute top-1 left-1 bg-[#FFC107] text-black text-[8px] font-black uppercase px-1 rounded shadow-lg">Hero</div>
                                    )}
                                </div>
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
                                    Clashing for over {yearsPlayed.level} years! 🏆
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
                        style={{ cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s' }}
                        onClick={() => onNavigateToClan?.(statsData.clan.tag)}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(251, 171, 255, 0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(82, 66, 81, 0.2)'; e.currentTarget.style.transform = 'none'; }}
                    >
                        <div className="px-4 pt-4 flex justify-between items-center">
                            <h3 className="text-xs uppercase tracking-[0.2em] font-black text-tertiary mb-0">Clan</h3>
                            <span className="material-symbols-outlined text-outline" style={{ fontSize: '1rem' }}>open_in_new</span>
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

            {/* Path of Legends */}
            {([
                statsData.currentPathOfLegendSeasonResult,
                statsData.lastPathOfLegendSeasonResult,
                statsData.bestPathOfLegendSeasonResult
            ].some(season => season && season.trophies > 0)) && (
                    <motion.div
                        className="pol-section mt-6"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
                            <h3 className="text-xs uppercase tracking-[0.2em] font-black text-tertiary">Path of Legends</h3>
                        </div>
                        <div className="pol-grid">
                            {[
                                { key: 'current', label: 'Current Season', data: statsData.currentPathOfLegendSeasonResult },
                                { key: 'last', label: 'Last Season', data: statsData.lastPathOfLegendSeasonResult },
                                { key: 'best', label: 'All Time Best', data: statsData.bestPathOfLegendSeasonResult }
                            ].filter(s => s.data).map((season, i) => {
                                const leagueNum = season.data.leagueNumber || 0;
                                const leagueImg = LEAGUE_IMAGES[Math.min(leagueNum, 10)] || LEAGUE_IMAGES[0];
                                const leagueName = LEAGUE_NAMES[Math.min(leagueNum, 10)] || 'Unknown';
                                const isBest = season.key === 'best';

                                return (
                                    <motion.div
                                        key={season.key}
                                        className={`pol-card ${isBest ? 'pol-card--best' : ''}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + i * 0.1 }}
                                    >

                                        <div className="pol-card-header">
                                            <span className="pol-card-label">{season.label}</span>
                                        </div>
                                        <div className="pol-card-body">
                                            <div className="pol-league-badge">
                                                <img src={leagueImg} alt={leagueName} />
                                            </div>
                                            <span className="pol-league-name">{leagueName}</span>
                                            <div className="pol-stats-row">
                                                <div className="pol-stat">
                                                    <span className="material-symbols-outlined pol-stat-icon" style={{ fontVariationSettings: "'FILL' 1", color: 'var(--color-secondary)' }}>emoji_events</span>
                                                    <span className="pol-stat-value">{(season.data.trophies || 0).toLocaleString()}</span>
                                                    <span className="pol-stat-label">Trophies</span>
                                                </div>
                                                {season.data.rank && season.data.rank > 0 && (
                                                    <div className="pol-stat">
                                                        <span className="material-symbols-outlined pol-stat-icon" style={{ fontVariationSettings: "'FILL' 1", color: 'var(--color-tertiary)' }}>leaderboard</span>
                                                        <span className="pol-stat-value">#{(season.data.rank).toLocaleString()}</span>
                                                        <span className="pol-stat-label">Rank</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

            {/* Card Progression — Current Deck */}
            {statsData.currentDeck && statsData.currentDeck.length > 0 && (
                <CardUpgradeSection
                    currentDeck={statsData.currentDeck}
                    cards={statsData.cards}
                    allCards={allCards}
                    playerName={statsData.name}
                    playerTag={statsData.tag}
                />
            )}

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
                        {masteryCards.map((card, i) => {
                            const hasError = imgErrors[`mastery_${i}`];
                            const imgSrc = hasError ? card.baseImageUrl : card.imageUrl;

                            return (
                                <motion.div
                                    key={card.name}
                                    className="mastery-card relative"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 + i * 0.05 }}
                                    style={{
                                        borderColor: card.level >= 8 ? 'var(--color-secondary)' : card.level >= 5 ? 'var(--color-primary)' : undefined
                                    }}
                                >
                                    {imgSrc ? (
                                        <img
                                            src={imgSrc}
                                            alt={card.name}
                                            onError={() => !hasError && setImgErrors(prev => ({ ...prev, [`mastery_${i}`]: true }))}
                                        />
                                    ) : card.badgeIconUrl ? (
                                        <img src={card.badgeIconUrl} alt={card.name} />
                                    ) : (
                                        <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
                                            <span className="material-symbols-outlined text-outline">help</span>
                                        </div>
                                    )}
                                    {card.isHero && hasError && (
                                        <div className="absolute top-1 left-1 bg-[#FFC107] text-black text-[6px] font-black uppercase px-0.5 rounded shadow-lg z-10">Hero</div>
                                    )}
                                    <div className="mastery-card-overlay">
                                        <span className="mastery-card-name">{card.name}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Battle Log */}
            <BattleLog playerTag={playerTag} onNavigateToPlayer={onNavigateToPlayer} />
        </div>
    );
};

export default PlayerStats;
