import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DeckFeedback from './DeckFeedback';
import { useAuth } from '../contexts/AuthContext';
import { fetchPlayerStats, fetchAllCards } from '../services/api';
import { calculateProgression } from '../utils/upgradeCalculator';
import { RARITY_CONFIG } from '../utils/upgradeData';
import CardUpgradeModal from './CardUpgradeModal';
import comboBadgePrimary from '../assets/agreementP.png';
import comboBadgeSecondary from '../assets/agreementB.png';

const DeckDisplay = ({ deckData, onViewStats, deckLabel, playerTag, hasVoted, onVoted }) => {
    const { favorites, addFavorite, removeFavorite } = useAuth();
    if (!deckData || !deckData.deck) return null;

    const { deck, averageElixir, tacticMessage, strategy, deepLink: backendDeepLink, towerTroopId, towerTroopName, towerTroopImageUrl } = deckData;

    const [imgErrors, setImgErrors] = useState({});

    // Upgrade calculator integration state
    const [allCards, setAllCards] = useState(null);
    const [playerCards, setPlayerCards] = useState(null);
    const [playerName, setPlayerName] = useState('');
    const [loadingStats, setLoadingStats] = useState(false);
    const [selectedCardEntry, setSelectedCardEntry] = useState(null);

    // Fetch all cards on mount
    useEffect(() => {
        const loadAllCards = async () => {
            try {
                const data = await fetchAllCards();
                setAllCards(data);
            } catch (err) {
                console.error('[DeckDisplay] Failed to fetch all cards:', err);
            }
        };
        loadAllCards();
    }, []);

    // Reset player collection cache if the tag changes
    useEffect(() => {
        setPlayerCards(null);
        setPlayerName('');
    }, [playerTag]);

    const handleCardClick = async (clickedCard) => {
        let currentCollection = playerCards;
        let name = playerName;

        // If playerTag is available but collection not loaded yet, fetch it on demand
        if (playerTag && !currentCollection && !loadingStats) {
            setLoadingStats(true);
            try {
                const data = await fetchPlayerStats(playerTag);
                currentCollection = data.cards || [];
                name = data.name || '';
                setPlayerCards(currentCollection);
                setPlayerName(name);
            } catch (err) {
                console.error('[DeckDisplay] Failed to fetch player stats on demand:', err);
            } finally {
                setLoadingStats(false);
            }
        }

        // 1. Resolve card from allCards database to get rarity etc.
        const baseCard = allCards?.find(c => c.id === clickedCard.id);
        const enrichedCard = { ...baseCard, ...clickedCard };

        // 2. Find the card in the player's collection
        const playerCard = currentCollection?.find(c => c.id === clickedCard.id);

        const rarity = (enrichedCard.rarity || 'common').toLowerCase();
        const config = RARITY_CONFIG[rarity];

        let absoluteLevel;
        let count = 0;

        if (playerCard) {
            // Player owns this card: use their actual level and count
            absoluteLevel = playerCard.level + (config ? config.relativeLevel : 0);
            count = playerCard.count || 0;
        } else {
            // Player doesn't own this card or no player loaded
            // Use card's level in the generated deck if available, otherwise rarity startLevel
            absoluteLevel = clickedCard.level || (config ? config.startLevel : 11);
            count = 0;
        }

        // Calculate progression
        const progression = calculateProgression(rarity, absoluteLevel, count);

        setSelectedCardEntry({
            card: { ...enrichedCard, count },
            absoluteLevel,
            progression
        });
    };

    // Use backend deep link (includes &tt=) or fallback to generating one
    const getDeckIds = () => deck.map(c => c.id).join(';');
    const generatedLink = backendDeepLink || `https://link.clashroyale.com/en/?clashroyale://copyDeck?deck=${getDeckIds()}&l=Royals`;

    const targetKey = getDeckIds();
    const isFavorited = favorites.some(f => f.type === 'DECK' && f.targetKey === targetKey);

    const handleFavoriteToggle = () => {
        if (isFavorited) {
            removeFavorite('DECK', targetKey);
        } else {
            const name = `${strategy || 'Custom'} Deck`;
            const metadata = {
                averageElixir: averageElixir,
                cards: deck.map(c => ({
                    name: c.name,
                    icon: c.evolved ? c.imageUriEvolved : c.isHero ? c.imageUriHero : c.imageUri
                }))
            };
            addFavorite('DECK', targetKey, name, JSON.stringify(metadata));
        }
    };

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
        <div className="layout-container-lg py-6 mt-2">
            {/* Header */}
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="hidden sm:block">
                    {deckLabel && (
                        <span className="inline-block bg-primary/15 text-primary text-[10px] uppercase tracking-[0.2em] font-bold px-3 py-1 rounded-full border border-primary/30 mb-3">
                            {deckLabel}
                        </span>
                    )}
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-on-background font-headline">
                        Your Forge <span className="text-primary italic">Results</span>
                    </h2>
                </div>
                <div className="flex gap-4">
                    {onViewStats && (
                        <button
                            onClick={onViewStats}
                            className="hidden md:flex items-center gap-2 bg-surface-container-highest text-on-surface hover:text-primary px-6 py-3 rounded-full transition-all active:scale-95 group border border-outline-variant/30 hover:border-primary/50"
                        >
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>query_stats</span>
                            <span>Player Stats</span>
                        </button>
                    )}
                    <button
                        onClick={handleFavoriteToggle}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all active:scale-95 border ${isFavorited
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/40 hover:bg-rose-500/25'
                            : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface border-outline-variant/30 hover:border-rose-500/40 hover:text-rose-400'
                            }`}
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                        <span className="hidden sm:inline">{isFavorited ? 'Saved' : 'Save'}</span>
                    </button>
                    <button
                        onClick={() => {
                            navigator.clipboard?.writeText(generatedLink);
                        }}
                        className="flex items-center gap-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-6 py-3 rounded-full transition-all active:scale-95 group"
                    >
                        <span className="material-symbols-outlined group-hover:text-primary">share</span>
                        <span>Share</span>
                    </button>
                    <button
                        onClick={() => window.open(generatedLink, '_blank')}
                        className="flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(251,171,255,0.4)] hover:shadow-[0_0_30px_rgba(251,171,255,0.6)] transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                        <span>Copy</span>
                    </button>
                </div>
            </header>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Deck Grid */}
                <div className="lg:col-span-8">
                    <motion.div
                        className="grid grid-cols-4 sm:grid-cols-4 gap-0.5 sm:gap-4"
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >
                        {deck.map((card, index) => {
                            const role = getRoleLabel(card, index);
                            const roleColor = getRoleColor(role);
                            const baseImgSrc = card.evolved
                                ? card.imageUriEvolved
                                : card.isHero
                                    ? card.imageUriHero
                                    : card.imageUri;

                            const hasError = imgErrors[card.id + '_' + index];
                            const imgSrc = hasError ? card.imageUri : baseImgSrc;

                            return (
                                <motion.div
                                    key={card.id || index}
                                    className={`relative group aspect-[285/420] rounded-sm sm:rounded-lg border border-outline-variant/20 bg-surface-container-low hover:border-primary/60 transition-all duration-300 cursor-pointer ${card.isHero && hasError ? 'ring-1 ring-secondary/50' : ''}`}
                                    variants={item}
                                    onClick={() => handleCardClick(card)}
                                >
                                    {/* Image and overlay container with overflow hidden */}
                                    <div className="absolute inset-0 rounded-sm sm:rounded-lg overflow-hidden pointer-events-none">
                                        <img
                                            className="w-full h-full object-cover pointer-events-auto"
                                            src={imgSrc}
                                            alt={card.name}
                                            onError={(e) => {
                                                if (!hasError) {
                                                    setImgErrors(prev => ({ ...prev, [card.id + '_' + index]: true }));
                                                } else {
                                                    e.target.src = 'https://placehold.co/300x420?text=Error';
                                                }
                                            }}
                                        />
                                        {/* Gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>
                                    </div>

                                    {/* Form Badges - Top Right */}
                                    {card.evolutionLevel === 2 && (
                                        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-[#FFC107] text-black px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-black uppercase shadow-lg z-10">
                                            Hero
                                        </div>
                                    )}
                                    {card.evolutionLevel === 1 && (
                                        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-primary text-on-primary px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-black uppercase shadow-lg z-10">
                                            Evo
                                        </div>
                                    )}

                                    {/* Combo Partner Badge - Top Right (perfectly on the corner) */}
                                    {card.comboGroup != null && (
                                        <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 z-20 combo-badge"
                                            title="Meta Combo Partner"
                                        >
                                            <img src={card.comboGroup === 1 ? comboBadgePrimary : comboBadgeSecondary} alt="Combo" className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-md" />
                                        </div>
                                    )}

                                    {/* Level badge - Top Left */}
                                    <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-surface-container-highest text-white px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-black tracking-tighter z-10">
                                        LVL {card.level || 11}
                                    </div>

                                    {/* Card info */}
                                    <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-3 sm:left-3 sm:right-3 flex justify-between items-end">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-[9px] sm:text-sm text-white truncate leading-tight">{card.name}</p>
                                        </div>
                                        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-primary-container rounded-full flex items-center justify-center text-on-primary-container text-[8px] sm:text-[10px] font-black shrink-0 ml-1">
                                            {card.elixirCost}
                                        </div>
                                    </div>

                                    {/* Hover border */}
                                    <div className="absolute inset-0 border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity rounded sm:rounded-lg pointer-events-none"></div>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* View Stats CTA — Under the deck, left of the sidebar */}
                    {onViewStats && (
                        <div className="mt-8 lg:mt-12">
                            <button
                                onClick={onViewStats}
                                className="w-full flex items-center justify-center gap-3 py-5 px-6 rounded-xl bg-gradient-to-r from-primary/10 via-surface-container-high to-secondary/10 border border-outline-variant/30 hover:border-primary/50 text-on-surface hover:text-primary transition-all group cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(251,171,255,0.15)]"
                            >
                                <span className="material-symbols-outlined text-2xl text-primary group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>query_stats</span>
                                <span className="text-sm font-headline font-black uppercase tracking-widest">Wanna see your stats?</span>
                                <span className="material-symbols-outlined text-lg text-outline group-hover:text-primary transition-colors">arrow_forward</span>
                            </button>
                        </div>
                    )}
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

            {/* Feedback */}
            <DeckFeedback
                deckData={deckData}
                playerTag={playerTag}
                hasVoted={hasVoted}
                onFeedbackSent={(vote) => onVoted?.(vote)}
            />

            {/* Backdrop loading stats spinner */}
            {loadingStats && (
                <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-[1100] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 bg-surface-container border border-outline-variant/30 px-6 py-4 rounded-2xl shadow-2xl">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface">Loading player stats...</p>
                    </div>
                </div>
            )}

            {/* Card progression details modal */}
            {selectedCardEntry && (
                <CardUpgradeModal
                    cards={playerCards || []}
                    allCards={allCards || []}
                    initialSelectedCard={selectedCardEntry}
                    onClose={() => setSelectedCardEntry(null)}
                    playerTag={playerTag}
                    playerName={playerName}
                />
            )}
        </div>
    );
};

export default DeckDisplay;
