import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { getCardDetail } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const METRICS = {
    usage: { key: 'usageRate', label: 'Usage %', color: '#fbabff' },
    winrate: { key: 'winRate', label: 'Win Rate %', color: '#ffc640' },
};

const fmtPct = (v) => (v == null ? '—' : `${v.toFixed(1)}%`);
const fmtInt = (v) => (v == null ? '—' : v.toLocaleString());
const fmtDay = (s) => {
    try {
        return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
        return s;
    }
};

const CardDetail = ({ cardId }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const evo = Number(searchParams.get('evo')) || 0;
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [metric, setMetric] = useState('usage');

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError(null);
        (async () => {
            try {
                const data = await getCardDetail(cardId, evo);
                if (mounted) setDetail(data);
            } catch (e) {
                if (mounted) setError('This card could not be loaded.');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [cardId, evo]);

    const chartData = useMemo(
        () => (detail?.trend || []).map((t) => ({ ...t, date: fmtDay(t.snapshotDate) })),
        [detail]
    );

    if (loading) {
        return (
            <div className="layout-container-lg pb-20">
                <div className="h-8 w-24 bg-surface-container-high rounded animate-pulse mb-6" />
                <div className="glass-panel rounded-2xl border border-outline-variant/20 h-40 animate-pulse mb-6" />
                <div className="glass-panel rounded-2xl border border-outline-variant/20 h-72 animate-pulse" />
            </div>
        );
    }

    if (error || !detail) {
        return (
            <div className="layout-container-lg pb-20">
                <BackButton onClick={() => navigate('/cards')} />
                <div className="glass-panel rounded-lg p-6 border border-error/30 text-error text-center max-w-lg mx-auto">
                    {error || 'Card not found.'}
                </div>
            </div>
        );
    }

    const { card, topDecks = [] } = detail;
    const activeMetric = METRICS[metric];
    const enoughTrend = chartData.length >= 2;

    return (
        <div className="layout-container-lg pb-20">
            <BackButton onClick={() => navigate('/cards')} />

            {/* Header */}
            <section className="glass-panel rounded-2xl border border-outline-variant/25 p-5 sm:p-6 mb-6 flex flex-col sm:flex-row gap-5 sm:items-center">
                <div className="w-28 h-36 sm:w-32 sm:h-40 rounded-[10px] overflow-hidden bg-surface-container-lowest shrink-0 mx-auto sm:mx-0">
                    <img
                        src={card.iconUrl}
                        alt={card.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.opacity = '0.2'; }}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-headline font-black text-white">{card.name}</h1>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {card.rarity && <Chip>{card.rarity}</Chip>}
                        {card.type && <Chip>{card.type}</Chip>}
                        {card.elixirCost != null && <Chip>{card.elixirCost} Elixir</Chip>}
                        {card.evolutionLevel === 2 && <Chip accent>Hero</Chip>}
                        {card.evolutionLevel === 1 && <Chip accent>Evolved</Chip>}
                        {card.isWinCondition && <Chip accent>Win Condition</Chip>}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                        <StatTile label="Rank" value={card.rank != null ? `#${card.rank}` : '—'} />
                        <StatTile label="Usage" value={fmtPct(card.usageRate)} />
                        <StatTile label="Win Rate" value={fmtPct(card.winRate)} accent="secondary" />
                        <StatTile label="Matches" value={fmtInt(card.matchesPlayed)} />
                    </div>
                </div>
            </section>

            {/* Trend chart */}
            <section className="glass-panel rounded-2xl border border-outline-variant/25 p-5 mb-8">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <h2 className="text-lg font-headline font-black uppercase tracking-wide text-white">
                        7-Day Trend
                    </h2>
                    <div className="flex gap-1 bg-surface-container-low rounded-full p-1 border border-outline-variant/20">
                        {Object.entries(METRICS).map(([key, m]) => (
                            <button
                                key={key}
                                onClick={() => setMetric(key)}
                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                                    metric === key
                                        ? 'bg-surface-container-highest text-white'
                                        : 'text-on-surface-variant hover:text-white'
                                }`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                {enoughTrend ? (
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={chartData} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                            <defs>
                                <linearGradient id="metricFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={activeMetric.color} stopOpacity={0.35} />
                                    <stop offset="100%" stopColor={activeMetric.color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                            <XAxis dataKey="date" tick={{ fill: '#d6c0d3', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                            <YAxis tick={{ fill: '#d6c0d3', fontSize: 12 }} tickLine={false} axisLine={false} width={48} unit="%" />
                            <Tooltip
                                contentStyle={{
                                    background: '#171f33',
                                    border: '1px solid rgba(173,198,255,0.2)',
                                    borderRadius: 12,
                                    color: '#dae2fd',
                                }}
                                labelStyle={{ color: '#fbabff', fontWeight: 700 }}
                                formatter={(value) => [`${Number(value).toFixed(1)}%`, activeMetric.label]}
                            />
                            <Area
                                type="monotone"
                                dataKey={activeMetric.key}
                                stroke={activeMetric.color}
                                strokeWidth={2.5}
                                fill="url(#metricFill)"
                                dot={{ r: 3, fill: activeMetric.color }}
                                activeDot={{ r: 5 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-40 flex flex-col items-center justify-center text-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-3xl mb-2 opacity-60">timeline</span>
                        <p className="text-sm max-w-xs">
                            Not enough history yet — trends appear once the card has a few days of
                            data. Check back tomorrow.
                        </p>
                    </div>
                )}
            </section>

            {/* Popular decks */}
            <section>
                <h2 className="text-lg font-headline font-black uppercase tracking-wide text-white mb-4">
                    Popular Decks with {card.name}
                </h2>
                {topDecks.length === 0 ? (
                    <p className="text-on-surface-variant text-sm">
                        No meta decks currently feature this card.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {topDecks.map((deck) => (
                            <DeckRow key={deck.deckKey} deck={deck} navigate={navigate} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

// ─── Sub-components ───

function BackButton({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="inline-flex items-center gap-1 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors mb-5"
        >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            All Cards
        </button>
    );
}

function Chip({ children, accent }) {
    return (
        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            accent
                ? 'bg-primary/15 text-primary border-primary/30'
                : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30'
        }`}>
            {children}
        </span>
    );
}

function StatTile({ label, value, accent }) {
    const valueColor = accent === 'secondary' ? 'text-secondary' : 'text-white';
    return (
        <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">{label}</p>
            <p className={`text-lg font-black ${valueColor}`}>{value}</p>
        </div>
    );
}

function DeckRow({ deck, navigate }) {
    const { favorites, addFavorite, removeFavorite } = useAuth();
    const owners = deck.topPlayers || [];

    const ids = (deck.cards || []).map((c) => c.id).filter(Boolean);
    const targetKey = ids.join(';');
    const towerTroopId = deck.towerTroopId || '159000000';
    const copyLink = `https://link.clashroyale.com/en/?clashroyale://copyDeck?deck=${targetKey}&l=Royals&tt=${towerTroopId}`;
    const isFavorited = (favorites || []).some((f) => f.type === 'DECK' && f.targetKey === targetKey);

    const handleFav = () => {
        if (isFavorited) {
            removeFavorite('DECK', targetKey);
        } else {
            const name = `${deck.winConditions?.split(',')[0] || deck.gameType || 'Meta'} Deck`;
            const metadata = {
                averageElixir: deck.averageElixir,
                cards: (deck.cards || []).map((c) => ({ name: c.name, icon: c.iconUrl })),
            };
            addFavorite('DECK', targetKey, name, JSON.stringify(metadata));
        }
    };

    return (
        <div className="glass-panel rounded-2xl border border-outline-variant/20 p-4">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                    {deck.gameType && (
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">{deck.gameType}</span>
                    )}
                    {deck.winConditions && (
                        <span className="text-xs text-on-surface-variant">{deck.winConditions}</span>
                    )}
                </div>
                <div className="flex items-center gap-3 text-xs">
                    {deck.averageElixir != null && (
                        <span className="text-on-surface-variant">
                            Avg <span className="text-white font-bold">{deck.averageElixir.toFixed(1)}</span>
                        </span>
                    )}
                    {deck.winRate != null && (
                        <span className="text-on-surface-variant">
                            WR <span className="text-secondary font-bold">{fmtPct(deck.winRate)}</span>
                        </span>
                    )}
                    <div className="flex items-center gap-1 ml-1">
                        <button
                            onClick={() => window.open(copyLink, '_blank')}
                            title="Copy deck to Clash Royale"
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface hover:text-primary hover:bg-surface-container-highest border border-outline-variant/30 hover:border-primary/40 transition-all active:scale-95"
                        >
                            <span className="material-symbols-outlined text-base">content_copy</span>
                        </button>
                        <button
                            onClick={handleFav}
                            title={isFavorited ? 'Saved to favorites' : 'Save to favorites'}
                            className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all active:scale-95 ${
                                isFavorited
                                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/40 hover:bg-rose-500/25'
                                    : 'bg-surface-container-high text-on-surface border-outline-variant/30 hover:text-rose-400 hover:border-rose-500/40'
                            }`}
                        >
                            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 8-card row */}
            <div className="grid grid-cols-8 gap-1.5">
                {(deck.cards || []).map((c, i) => (
                    <button
                        key={`${c.id}-${i}`}
                        onClick={() => c.id && navigate(`/cards/${c.id}?evo=${c.evolutionLevel || 0}`)}
                        title={c.name}
                        className="relative rounded-md overflow-hidden bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/60 transition-colors aspect-[3/4]"
                    >
                        <img
                            src={c.iconUrl}
                            alt={c.name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.opacity = '0.2'; }}
                        />
                        {c.evolutionLevel === 1 && (
                            <span className="absolute top-0.5 left-0.5 bg-primary text-on-primary text-[7px] font-black uppercase px-0.5 rounded">E</span>
                        )}
                        {c.evolutionLevel === 2 && (
                            <span className="absolute top-0.5 left-0.5 bg-secondary text-on-secondary text-[7px] font-black uppercase px-0.5 rounded">H</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Owners */}
            {owners.length > 0 && (
                <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-on-surface-variant">Played by:</span>
                    {owners.map((p, i) => (
                        <button
                            key={`${p.tag}-${i}`}
                            onClick={() => p.tag && navigate(`/player/${p.tag.replace(/#/g, '')}`)}
                            className="font-bold text-tertiary hover:text-primary transition-colors"
                        >
                            {p.name || p.tag}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CardDetail;
