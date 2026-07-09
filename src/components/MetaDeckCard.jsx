import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * A single meta deck row: game type / win conditions, avg elixir + win rate,
 * copy + favorite buttons, an 8-card grid, and the top players who run it.
 * Shared by the Card detail page ("Popular Decks") and the Decks browse page.
 */

const fmtPct = (v) => (v == null ? '—' : `${v.toFixed(1)}%`);
const fmtInt = (v) => (v == null ? '—' : v.toLocaleString());

function MetaDeckCard({ deck }) {
    const navigate = useNavigate();
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
        <div className="glass-panel rounded-2xl border border-outline-variant/20 p-4 relative">
            <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-2 sm:gap-4 mb-3 pr-20">
                <div className="flex items-center gap-2 flex-wrap">
                    {deck.popularityRank != null && (
                        <span className="bg-surface-container-highest/90 text-primary text-[10px] font-black px-1.5 py-0.5 rounded tracking-tight">
                            #{deck.popularityRank}
                        </span>
                    )}
                    {deck.gameType && (
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">{deck.gameType}</span>
                    )}
                    {deck.winConditions && (
                        <span className="text-xs text-on-surface-variant">{deck.winConditions}</span>
                    )}
                </div>
                <div className="flex items-center gap-3 text-xs flex-wrap">
                    {deck.usageCount != null && (
                        <span className="text-on-surface-variant">
                            <span className="text-white font-bold">{fmtInt(deck.usageCount)}</span> players
                        </span>
                    )}
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
                </div>
            </div>

            <div className="absolute top-4 sm:top-2.5 right-4 flex items-center gap-1.5">
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

export default MetaDeckCard;
