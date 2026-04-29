import { motion } from 'framer-motion';

const DeckDisplay = ({ deckData }) => {
    if (!deckData || !deckData.deck) return null;

    const { deck, averageElixir, tacticMessage, strategy, deepLink: backendDeepLink, towerTroopId, towerTroopName, towerTroopImageUrl } = deckData;

    // Sort: Evolved first, then Hero, then by elixir
    const sortedDeck = [...deck].sort((a, b) => {
        const aEvolved = a.evolved ? 1 : 0;
        const bEvolved = b.evolved ? 1 : 0;
        if (aEvolved !== bEvolved) return bEvolved - aEvolved;
        const aHero = a.isHero ? 1 : 0;
        const bHero = b.isHero ? 1 : 0;
        if (aHero !== bHero) return bHero - aHero;
        return (a.elixirCost || 0) - (b.elixirCost || 0);
    });

    // Use backend deep link (includes &tt=) or fallback to generating one
    const getDeckIds = () => sortedDeck.map(c => c.id).join(';');
    const generatedLink = backendDeepLink || `https://link.clashroyale.com/en/?clashroyale://copyDeck?deck=${getDeckIds()}&l=Royals`;

    // Decide elixir speed label
    const speedLabel = averageElixir <= 3.0 ? 'Very Fast' : averageElixir <= 3.5 ? 'Fast' : averageElixir <= 4.0 ? 'Medium' : 'Heavy';
    const elixirPercent = Math.min((averageElixir / 6) * 100, 100);

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };

    const item = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        show: { opacity: 1, y: 0, scale: 1 }
    };

    // Assign roles (simplified)
    const getRoleLabel = (card, index) => {
        if (card.isHero) return 'Hero';
        if (card.evolved) return 'Evolved';
        if (index === 0) return 'Win Condition';
        if ((card.elixirCost || 0) >= 5) return 'Tank';
        if ((card.elixirCost || 0) <= 2) return 'Cycle';
        return 'Support';
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'Win Condition': return 'text-primary';
            case 'Evolved': return 'text-primary';
            case 'Hero': return 'text-secondary';
            case 'Tank': return 'text-primary';
            case 'Cycle': return 'text-tertiary';
            default: return 'text-on-surface-variant';
        }
    };

    return (
        <div className="layout-container-lg py-8 mt-6">
            {/* Header */}
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-secondary/20 text-secondary text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border border-secondary/30">
                            Legendary Blueprint
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-on-background font-headline">
                        Your Forge <span className="text-primary italic">Results</span>
                    </h2>
                    <p className="text-on-surface-variant mt-3 max-w-xl text-lg">
                        {tacticMessage || 'A precision-engineered deck optimized for your card levels.'}
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            navigator.clipboard?.writeText(generatedLink);
                        }}
                        className="flex items-center gap-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-6 py-3 rounded-full transition-all active:scale-95 group"
                    >
                        <span className="material-symbols-outlined group-hover:text-primary">share</span>
                        <span>Share Deck</span>
                    </button>
                    <button
                        onClick={() => window.open(generatedLink, '_blank')}
                        className="flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(251,171,255,0.4)] hover:shadow-[0_0_30px_rgba(251,171,255,0.6)] transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                        <span>Copy to Game</span>
                    </button>
                </div>
            </header>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Deck Grid */}
                <div className="lg:col-span-8">
                    <motion.div
                        className="grid grid-cols-4 sm:grid-cols-4 gap-2 sm:gap-4"
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >
                        {sortedDeck.map((card, index) => {
                            const role = getRoleLabel(card, index);
                            const roleColor = getRoleColor(role);
                            const imgSrc = card.evolved
                                ? card.imageUriEvolved
                                : card.isHero
                                    ? card.imageUriHero
                                    : card.imageUri;

                            return (
                                <motion.div
                                    key={card.id || index}
                                    className="relative group aspect-[3/4] rounded-lg overflow-hidden border border-outline-variant/20 bg-surface-container-low hover:border-primary/60 transition-all duration-300 cursor-pointer"
                                    variants={item}
                                >
                                    <img
                                        className="w-full h-full object-cover"
                                        src={imgSrc}
                                        alt={card.name}
                                        onError={(e) => { e.target.src = 'https://placehold.co/300x400?text=Card'; }}
                                    />
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>

                                    {/* Level badge */}
                                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-secondary text-on-secondary px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-black tracking-tighter">
                                        LVL {card.level || 11}
                                    </div>

                                    {/* Card info */}
                                    <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-3 sm:left-3 sm:right-3 flex justify-between items-end">
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-[7px] sm:text-[10px] ${roleColor} font-bold uppercase tracking-widest truncate`}>{role}</p>
                                            <p className="font-bold text-[9px] sm:text-sm text-white truncate leading-tight">{card.name}</p>
                                        </div>
                                        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-primary-container rounded-full flex items-center justify-center text-on-primary-container text-[8px] sm:text-[10px] font-black shrink-0 ml-1">
                                            {card.elixirCost}
                                        </div>
                                    </div>

                                    {/* Hover border */}
                                    <div className="absolute inset-0 border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none"></div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>

                {/* Stats Sidebar */}
                <aside className="lg:col-span-4 space-y-6">
                    {/* Deck Breakdown */}
                    <div className="glass-panel p-6 rounded-lg border border-outline-variant/20 relative overflow-hidden">
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 blur-3xl"></div>
                        <h3 className="text-xs uppercase tracking-[0.2em] font-black text-tertiary mb-8">Deck Breakdown</h3>
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <span className="text-on-surface-variant">Average Elixir</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-primary">{averageElixir?.toFixed(1) || 'N/A'}</span>
                                    <span className="text-xs text-primary/60 font-bold uppercase tracking-widest">{speedLabel}</span>
                                </div>
                            </div>
                            <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${elixirPercent}%`, boxShadow: '0 0 10px #fbabff' }}></div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-on-surface-variant">Archetype</span>
                                <span className="font-bold text-lg text-secondary">{strategy || 'Balanced'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Pro Tip */}
                    <div className="bg-gradient-to-br from-primary/20 to-secondary/10 p-1 rounded-lg">
                        <div className="bg-surface-container-low p-6 rounded-[0.75rem]">
                            <p className="text-xs font-bold text-primary uppercase tracking-[0.15em] mb-2">Strategy</p>
                            <p className="text-sm italic leading-relaxed text-on-surface-variant">
                                {tacticMessage || 'A well-balanced deck designed to leverage your strongest cards.'}
                            </p>
                        </div>
                    </div>

                    {/* Tower Troop */}
                    {towerTroopName && (
                        <div className="flex items-center gap-4 mt-2 pt-4 border-t border-outline-variant/20">
                            {towerTroopImageUrl && (
                                <img
                                    src={towerTroopImageUrl}
                                    alt={towerTroopName}
                                    className="w-12 h-12 rounded-lg border border-outline-variant/30 object-cover bg-surface-container-highest"
                                />
                            )}
                            <div>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-tertiary">Tower Troop</p>
                                <p className="text-sm font-bold text-on-surface">{towerTroopName}</p>
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default DeckDisplay;
