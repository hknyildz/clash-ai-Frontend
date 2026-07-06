import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCardStats } from '../services/api';

/**
 * Card Statistics page — a boxy, minimalist grid of every Clash Royale card,
 * ranked by meta usage, with filter chips and two "hero" highlight boxes.
 * Clicking a card opens its detail page (/cards/:cardId).
 */

const FILTERS = [
    { key: 'all', label: 'All', match: () => true },
    { key: 'wincon', label: 'Win Conditions', match: (c) => c.winCondition },
    { key: 'troops', label: 'Troops', match: (c) => c.troop },
    { key: 'spells', label: 'Spells', match: (c) => c.spell },
    { key: 'buildings', label: 'Buildings', match: (c) => c.building },
    { key: 'evolutions', label: 'Evolutions', match: (c) => c.evolutionLevel === 1 },
    { key: 'heroes', label: 'Heroes', match: (c) => c.evolutionLevel === 2 },
];

// A card must be played in at least this fraction of the most-played card's
// matches to qualify for the "highest win rate" highlight (avoids small-sample noise).
const WINRATE_SAMPLE_FRACTION = 0.05;

const fmtPct = (v) => (v == null ? '—' : `${v.toFixed(1)}%`);
const fmtInt = (v) => (v == null ? '—' : v.toLocaleString());

function winRateClass(wr) {
    if (wr == null) return 'text-on-surface-variant';
    if (wr >= 55) return 'text-emerald-400';
    if (wr >= 50) return 'text-secondary';
    if (wr >= 45) return 'text-on-surface';
    return 'text-error';
}

const Cards = () => {
    const navigate = useNavigate();
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await getCardStats();
                if (mounted) setCards(Array.isArray(data) ? data : []);
            } catch (e) {
                if (mounted) setError('Card stats could not be loaded. Please try again later.');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const playedCards = useMemo(
        () => cards.filter((c) => c.matchesPlayed && c.matchesPlayed > 0),
        [cards]
    );

    // Highlight #1 — highest usage (rank 1)
    const kingOfMeta = useMemo(() => {
        return playedCards.reduce(
            (best, c) => (best == null || (c.usageRate ?? 0) > (best.usageRate ?? 0) ? c : best),
            null
        );
    }, [playedCards]);

    // Highlight #2 — highest win rate among sufficiently-played cards
    const topWinner = useMemo(() => {
        if (playedCards.length === 0) return null;
        const maxMatches = Math.max(...playedCards.map((c) => c.matchesPlayed || 0));
        const threshold = maxMatches * WINRATE_SAMPLE_FRACTION;
        const eligible = playedCards.filter((c) => (c.matchesPlayed || 0) >= threshold);
        const pool = eligible.length > 0 ? eligible : playedCards;
        return pool.reduce(
            (best, c) => (best == null || (c.winRate ?? 0) > (best.winRate ?? 0) ? c : best),
            null
        );
    }, [playedCards]);

    const filtered = useMemo(() => {
        const f = FILTERS.find((x) => x.key === activeFilter) || FILTERS[0];
        let result = cards.filter(f.match);
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            result = result.filter(c => c.name.toLowerCase().includes(q));
        }
        return result;
    }, [cards, activeFilter, searchQuery]);

    return (
        <div className="layout-container-lg pb-20">
            {/* Header */}
            <header className="text-center max-w-2xl mx-auto mb-8">
                <h1 className="text-3xl sm:text-4xl font-headline font-black uppercase tracking-tight text-white">
                    Card <span className="text-gradient">Statistics</span>
                </h1>
                <p className="mt-3 text-sm sm:text-base text-on-surface-variant">
                    Every card ranked by real usage and win rate from top-ladder battles.
                    Updated daily.
                </p>
            </header>

            {loading ? (
                <CardsSkeleton />
            ) : error ? (
                <div className="glass-panel rounded-lg p-6 border border-error/30 text-error text-center max-w-lg mx-auto">
                    {error}
                </div>
            ) : (
                <>
                    {/* Highlight boxes */}
                    {(kingOfMeta || topWinner) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <HighlightBox
                                label="King of the Meta"
                                sublabel="Highest usage"
                                icon="crown"
                                accent="primary"
                                card={kingOfMeta}
                                statLabel="Usage"
                                statValue={fmtPct(kingOfMeta?.usageRate)}
                                onClick={() => kingOfMeta && navigate(`/cards/${kingOfMeta.cardId}?evo=${kingOfMeta.evolutionLevel}`)}
                            />
                            <HighlightBox
                                label="Top Winner"
                                sublabel="Highest win rate"
                                icon="trophy"
                                accent="secondary"
                                card={topWinner}
                                statLabel="Win Rate"
                                statValue={fmtPct(topWinner?.winRate)}
                                onClick={() => topWinner && navigate(`/cards/${topWinner.cardId}?evo=${topWinner.evolutionLevel}`)}
                            />
                        </div>
                    )}

                    {/* Search Bar */}
                    <div className="max-w-sm mx-auto mb-4">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-[20px]">search</span>
                            <input
                                type="text"
                                placeholder="Search cards by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-surface-container-lowest text-sm text-white border border-outline-variant/30 rounded-[4px] py-2 pl-9 pr-4 focus:outline-none focus:border-primary/50 transition-colors placeholder:text-on-surface-variant/50"
                            />
                        </div>
                    </div>

                    {/* Filter chips */}
                    <div className="flex flex-wrap gap-2 mb-6 justify-center">
                        {FILTERS.map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setActiveFilter(f.key)}
                                className={`px-4 py-1.5 rounded-full text-xs font-headline font-bold uppercase tracking-wider border transition-all duration-200 ${
                                    activeFilter === f.key
                                        ? 'bg-primary text-on-primary border-primary'
                                        : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:text-primary hover:border-primary/50'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Grid */}
                    {filtered.length === 0 ? (
                        <p className="text-center text-on-surface-variant py-16">
                            No cards match this filter.
                        </p>
                    ) : (
                        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3">
                            {filtered.map((card) => (
                                <CardTile
                                    key={`${card.cardId}-${card.evolutionLevel}`}
                                    card={card}
                                    onClick={() => navigate(`/cards/${card.cardId}?evo=${card.evolutionLevel}`)}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// ─── Grid tile ───
function CardTile({ card, onClick }) {
    const hasStats = card.usageRate != null;
    return (
        <button
            onClick={onClick}
            className="group text-left rounded-[4px] overflow-hidden bg-surface-container-low border border-outline-variant/20 hover:border-primary/60 transition-all duration-300 flex flex-col"
        >
            <div className="relative aspect-[3/4] bg-surface-container-lowest overflow-hidden">
                <img
                    src={card.iconUrl}
                    alt={card.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.currentTarget.style.opacity = '0.2'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent" />

                {/* Rank badge */}
                {card.rank != null && (
                    <span className="absolute top-1.5 left-1.5 bg-surface-container-highest/90 text-primary text-[10px] font-black px-1.5 py-0.5 rounded tracking-tight">
                        #{card.rank}
                    </span>
                )}
                {/* Elixir badge */}
                {card.elixirCost != null && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary-container rounded-full flex items-center justify-center text-white text-[10px] font-black">
                        {card.elixirCost}
                    </span>
                )}
                {/* Form tag */}
                <div className="absolute bottom-1.5 left-1.5 flex gap-1">
                    {card.evolutionLevel === 2 && (
                        <span className="bg-secondary text-on-secondary text-[8px] font-black uppercase px-1 rounded">Hero</span>
                    )}
                    {card.evolutionLevel === 1 && (
                        <span className="bg-primary text-on-primary text-[8px] font-black uppercase px-1 rounded">Evo</span>
                    )}
                </div>
            </div>

            <div className="p-1.5 sm:p-2">
                <p className="font-bold text-[11px] sm:text-sm text-white truncate leading-tight">{card.name}</p>
                <div className="mt-1 flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between text-[10px] sm:text-[11px]">
                    <span className="text-on-surface-variant">
                        Use <span className="text-on-surface font-bold">{fmtPct(card.usageRate)}</span>
                    </span>
                    <span className="text-on-surface-variant">
                        WR <span className={`font-bold ${winRateClass(card.winRate)}`}>{hasStats ? fmtPct(card.winRate) : '—'}</span>
                    </span>
                </div>
            </div>
        </button>
    );
}

// ─── Highlight box ───
function HighlightBox({ label, sublabel, icon, accent, card, statLabel, statValue, onClick }) {
    const accentText = accent === 'secondary' ? 'text-secondary' : 'text-primary';
    const accentGlow = accent === 'secondary'
        ? 'shadow-[0_0_24px_rgba(255,198,64,0.18)]'
        : 'shadow-[0_0_24px_rgba(251,171,255,0.18)]';
    return (
        <button
            onClick={onClick}
            disabled={!card}
            className={`glass-panel text-left rounded-2xl border border-outline-variant/25 p-4 sm:p-5 flex items-center gap-4 transition-all duration-300 hover:border-primary/40 ${accentGlow} disabled:opacity-50`}
        >
            <div className="relative shrink-0">
                <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-[4px] overflow-hidden bg-surface-container-lowest">
                    {card && (
                        <img
                            src={card.iconUrl}
                            alt={card.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.opacity = '0.2'; }}
                        />
                    )}
                </div>
            </div>
            <div className="min-w-0 flex-1">
                <div className={`flex items-center gap-1.5 text-[11px] font-headline font-black uppercase tracking-widest ${accentText}`}>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                    {label}
                </div>
                <p className="text-[11px] text-on-surface-variant mb-1">{sublabel}</p>
                <p className="text-lg sm:text-xl font-black text-white truncate">{card?.name ?? '—'}</p>
                <p className="mt-1 text-sm text-on-surface-variant">
                    {statLabel}: <span className={`font-black ${accentText}`}>{statValue}</span>
                    {card?.matchesPlayed != null && (
                        <span className="text-on-surface-variant/70"> · {fmtInt(card.matchesPlayed)} matches</span>
                    )}
                </p>
            </div>
        </button>
    );
}

// ─── Loading skeleton ───
function CardsSkeleton() {
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[0, 1].map((i) => (
                    <div key={i} className="glass-panel rounded-2xl border border-outline-variant/20 p-5 h-28 animate-pulse" />
                ))}
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3">
                {Array.from({ length: 21 }).map((_, i) => (
                    <div key={i} className="rounded-[4px] bg-surface-container-low border border-outline-variant/20 overflow-hidden">
                        <div className="aspect-[3/4] bg-surface-container animate-pulse" />
                        <div className="p-2 space-y-2">
                            <div className="h-3 bg-surface-container-high rounded animate-pulse" />
                            <div className="h-2.5 bg-surface-container-high rounded animate-pulse w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Cards;
