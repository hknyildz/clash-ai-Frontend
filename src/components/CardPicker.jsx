import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAllCards } from '../services/api';
import './CardPicker.css';

const RARITIES = ['All', 'Common', 'Rare', 'Epic', 'Legendary', 'Champion'];

const CardPicker = ({ isOpen, onClose, onSelectCard, existingDeckIds, activeSlotIndex }) => {
    const [cards, setCards] = useState([]);
    const [filteredCards, setFilteredCards] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRarity, setSelectedRarity] = useState('All');
    const [loading, setLoading] = useState(false);
    const [imgErrors, setImgErrors] = useState({});

    useEffect(() => {
        if (isOpen && cards.length === 0) {
            setLoading(true);
            console.log("[CardPicker] Opening picker, fetching cards...");
            fetchAllCards()
                .then(data => {
                    console.log("[CardPicker] Data received:", data.length, "cards");
                    let expandedCards = [];
                    data.forEach(c => {
                        if (c.rarity?.toLowerCase() === 'champion') {
                            expandedCards.push({ ...c, selectedForm: 'hero', uid: c.id + '_hero', isHero: true, evolutionLevel: 2 });
                        } else {
                            expandedCards.push({ ...c, selectedForm: 'normal', uid: c.id + '_normal', isHero: false, evolved: false, evolutionLevel: 0 });
                            if (c.evolved) {
                                expandedCards.push({ ...c, selectedForm: 'evolved', uid: c.id + '_evolved', rarity: 'Evolved', isHero: false, evolved: true, evolutionLevel: 1 });
                            }
                            if (c.isHero) {
                                expandedCards.push({ ...c, selectedForm: 'hero', uid: c.id + '_hero', rarity: 'Champion', isHero: true, evolved: false, evolutionLevel: 2 });
                            }
                        }
                    });
                    const sorted = expandedCards.sort((a, b) => a.elixirCost - b.elixirCost);
                    console.log("[CardPicker] Expanded & Sorted cards count:", sorted.length);
                    setCards(sorted);
                })
                .catch(err => console.error("[CardPicker] Fetch error:", err))
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    // Compute dynamic rarities based on slot rules
    const dynamicRarities = (() => {
        let filters = ['All', 'Common', 'Rare', 'Epic', 'Legendary'];
        if (activeSlotIndex === 0 || activeSlotIndex === 2) filters.push('Evolved');
        if (activeSlotIndex === 1 || activeSlotIndex === 2) filters.push('Champion');
        return filters;
    })();

    // Auto-reset rarity filter if it becomes unavailable for this slot
    useEffect(() => {
        if (!dynamicRarities.includes(selectedRarity)) {
            setSelectedRarity('All');
        }
    }, [activeSlotIndex]);

    useEffect(() => {
        console.log("[CardPicker] Filtering for slot index:", activeSlotIndex);
        let result = cards;

        // Slot-based architectural restrictions
        if (activeSlotIndex === 0) {
            console.log("[CardPicker] Applying Slot 1 (Evo Only) filter");
            result = result.filter(c => c.selectedForm !== 'hero');
        } else if (activeSlotIndex === 1) {
            console.log("[CardPicker] Applying Slot 2 (Hero Only) filter");
            result = result.filter(c => c.selectedForm !== 'evolved');
        } else if (activeSlotIndex === 2) {
            console.log("[CardPicker] Applying Slot 3 (Both OK) filter");
        } else if (activeSlotIndex > 2) {
            console.log("[CardPicker] Applying Slot 4-8 (Normal Only) filter");
            result = result.filter(c => c.selectedForm === 'normal');
        }

        // Text Search
        if (searchTerm) {
            result = result.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        // Rarity Filter (applied on top of slot restrictions)
        if (selectedRarity !== 'All') {
            if (selectedRarity === 'Evolved') {
                result = result.filter(c => c.selectedForm === 'evolved');
            } else if (selectedRarity === 'Champion') {
                result = result.filter(c => c.selectedForm === 'hero');
            } else {
                result = result.filter(c => c.rarity && c.rarity.toLowerCase() === selectedRarity.toLowerCase() && c.selectedForm === 'normal');
            }
        }

        setFilteredCards(result);
    }, [searchTerm, selectedRarity, cards, activeSlotIndex]);

    // Handle "Escape" key to close
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="card-picker-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <div className="card-picker-modal glass-panel" onClick={e => e.stopPropagation()}>
                    <div className="picker-header">
                        <h2>Select a Card</h2>
                        <button className="close-btn" onClick={onClose}>&times;</button>
                    </div>

                    <div className="picker-controls">
                        <input
                            type="text"
                            placeholder="Search cards..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="picker-search"
                            autoFocus
                        />
                        <div className="rarity-filters">
                            {dynamicRarities.map(r => (
                                <button
                                    key={r}
                                    className={`rarity-chip ${selectedRarity === r ? 'active' : ''} ${r === 'Evolved' ? 'border-primary/50 text-primary hover:bg-primary/10' : ''} ${r === 'Champion' ? 'border-secondary/50 text-secondary hover:bg-secondary/10' : ''}`}
                                    onClick={() => setSelectedRarity(r)}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="picker-grid-container">
                        {loading ? (
                            <div className="picker-loading">Loading cards...</div>
                        ) : (
                            <div className="picker-grid">
                                {filteredCards.map(card => {
                                    const isSelected = existingDeckIds.includes(card.id);
                                    const baseImgSrc = card.selectedForm === 'evolved' ? (card.imageUriEvolved || card.imageUri) : (card.selectedForm === 'hero' ? card.imageUriHero : card.imageUri);
                                    
                                    const hasError = imgErrors[card.uid];
                                    const imgSrc = hasError ? card.imageUri : baseImgSrc;

                                    return (
                                        <div
                                            key={card.uid}
                                            className={`picker-card-slot ${isSelected ? 'disabled opacity-30 cursor-not-allowed grayscale' : ''} ${card.selectedForm === 'evolved' ? 'border border-primary/40 shadow-[0_0_15px_rgba(251,171,255,0.1)]' : ''} ${card.selectedForm === 'hero' ? 'border border-secondary/40 shadow-[0_0_15px_rgba(255,193,7,0.15)]' : ''}`}
                                            onClick={() => !isSelected && onSelectCard(card)}
                                        >
                                            <div className="picker-card-image-container relative">
                                                <img
                                                    src={imgSrc}
                                                    alt={card.name}
                                                    loading="lazy"
                                                    className="picker-card-img"
                                                    onError={() => {
                                                        console.log("[CardPicker] Image failed to load:", card.name, "Form:", card.selectedForm, "UID:", card.uid);
                                                        if (!hasError) setImgErrors(prev => ({ ...prev, [card.uid]: true }));
                                                    }}
                                                />
                                                {/* Form Badges - Top Right */}
                                                {card.evolutionLevel === 2 && (
                                                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-[#FFC107] text-black px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-black uppercase shadow-lg z-10">
                                                        Hero
                                                    </div>
                                                )}
                                                {card.evolutionLevel === 1 && (
                                                    <div className="absolute top-1 right-1 bg-primary text-[8px] font-black uppercase text-on-primary px-1 rounded shadow-lg z-10">Evo</div>
                                                )}
                                                <div className="picker-card-cost">{card.elixirCost}</div>
                                            </div>
                                            <span className={`picker-card-name ${card.selectedForm === 'evolved' ? 'text-primary drop-shadow-[0_0_5px_rgba(251,171,255,0.5)]' : ''}`}>{card.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CardPicker;
