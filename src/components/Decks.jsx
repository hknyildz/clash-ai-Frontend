import { useEffect, useMemo, useState } from 'react';
import { getMetaDecks } from '../services/api';
import MetaDeckCard from './MetaDeckCard';

/**
 * Meta Decks browse page — every top-ladder meta deck, ranked by usage, with
 * game-type filter chips and a card-name search. Reuses MetaDeckCard for rendering.
 */

const Decks = () => {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gameType, setGameType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await getMetaDecks(300);
                if (mounted) setDecks(Array.isArray(data) ? data : []);
            } catch (e) {
                if (mounted) setError('Meta decks could not be loaded. Please try again later.');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    // Distinct game types present in the data, for the filter chips.
    const gameTypes = useMemo(() => {
        const set = new Set();
        decks.forEach((d) => { if (d.gameType) set.add(d.gameType); });
        return ['all', ...Array.from(set).sort()];
    }, [decks]);

    const filtered = useMemo(() => {
        let result = decks;
        if (gameType !== 'all') {
            result = result.filter((d) => d.gameType === gameType);
        }
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            result = result.filter((d) =>
                (d.cards || []).some((c) => c.name && c.name.toLowerCase().includes(q))
            );
        }
        return result;
    }, [decks, gameType, searchQuery]);

    return (
        <div className="layout-container-lg pb-20">
            {/* Header */}
            <header className="text-center max-w-2xl mx-auto mb-8">
                <h1 className="text-3xl sm:text-4xl font-headline font-black uppercase tracking-tight text-white">
                    Meta <span className="text-gradient">Decks</span>
                </h1>
                <p className="mt-3 text-sm sm:text-base text-on-surface-variant">
                    The most-played decks from top-ladder battles, ranked by usage.
                    Updated daily.
                </p>
            </header>

            {loading ? (
                <DecksSkeleton />
            ) : error ? (
                <div className="glass-panel rounded-lg p-6 border border-error/30 text-error text-center max-w-lg mx-auto">
                    {error}
                </div>
            ) : (
                <>
                    {/* Search Bar */}
                    <div className="max-w-sm mx-auto mb-4">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-[20px]">search</span>
                            <input
                                type="text"
                                placeholder="Search decks by card..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-surface-container-lowest text-sm text-white border border-outline-variant/30 rounded-[4px] py-2 pl-9 pr-4 focus:outline-none focus:border-primary/50 transition-colors placeholder:text-on-surface-variant/50"
                            />
                        </div>
                    </div>

                    {/* Game-type filter chips */}
                    <div className="flex flex-wrap gap-2 mb-6 justify-center">
                        {gameTypes.map((gt) => (
                            <button
                                key={gt}
                                onClick={() => setGameType(gt)}
                                className={`px-4 py-1.5 rounded-full text-xs font-headline font-bold uppercase tracking-wider border transition-all duration-200 ${
                                    gameType === gt
                                        ? 'bg-primary text-on-primary border-primary'
                                        : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:text-primary hover:border-primary/50'
                                }`}
                            >
                                {gt === 'all' ? 'All' : gt}
                            </button>
                        ))}
                    </div>

                    {/* Deck list */}
                    {filtered.length === 0 ? (
                        <p className="text-center text-on-surface-variant py-16">
                            {decks.length === 0
                                ? 'No meta decks available yet.'
                                : 'No decks match this filter.'}
                        </p>
                    ) : (
                        <div className="space-y-4 max-w-3xl mx-auto">
                            {filtered.map((deck) => (
                                <MetaDeckCard key={deck.deckKey} deck={deck} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// ─── Loading skeleton ───
function DecksSkeleton() {
    return (
        <div className="space-y-4 max-w-3xl mx-auto">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-panel rounded-2xl border border-outline-variant/20 p-4">
                    <div className="h-4 w-40 bg-surface-container-high rounded animate-pulse mb-3" />
                    <div className="grid grid-cols-8 gap-1.5">
                        {Array.from({ length: 8 }).map((_, j) => (
                            <div key={j} className="aspect-[3/4] rounded-md bg-surface-container animate-pulse" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Decks;
