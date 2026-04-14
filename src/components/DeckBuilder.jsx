import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import CardPicker from './CardPicker';
import { completeDeck } from '../services/api';
import DeckDisplay from './DeckDisplay';
import './DeckBuilder.css';
import { StrategyIcons } from './StrategyIcons';

const PLAYSTYLES = [
    'Cycle', 'Beatdown', 'Control', 'Siege', 'Recall', 'Bait', 'Balanced'
];

const DeckBuilder = ({ playerTag }) => {
    // Array of 8 slots, initially null
    const [deckSlots, setDeckSlots] = useState(Array(8).fill(null));
    const [selectedPlaystyle, setSelectedPlaystyle] = useState('Balanced');
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [activeSlotIndex, setActiveSlotIndex] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedResult, setGeneratedResult] = useState(null);
    const builderResultRef = useRef(null);

    const handleSlotClick = (index) => {
        // If slot is empty or occupied, open picker to replace/fill
        setActiveSlotIndex(index);
        setIsPickerOpen(true);
    };

    const handleSelectCard = (card) => {
        const newSlots = [...deckSlots];
        // Check if card is already in deck? (CardPicker handles this visual, but logic here too)
        if (newSlots.some(c => c && c.id === card.id)) {
            alert("Card already in deck!"); // Simple validation
            return;
        }
        newSlots[activeSlotIndex] = card;
        setDeckSlots(newSlots);
        setIsPickerOpen(false);
    };

    const handleRemoveCard = (e, index) => {
        e.stopPropagation();
        const newSlots = [...deckSlots];
        newSlots[index] = null;
        setDeckSlots(newSlots);
    };

    const handleGenerate = async () => {
        if (!playerTag || !playerTag.trim()) {
            alert("Please enter a Player Tag first!");
            return;
        }

        setIsGenerating(true);
        setGeneratedResult(null);
        try {
            // Filter out null slots to get partial IDs
            const partialIds = deckSlots.filter(c => c !== null).map(c => c.id);

            // Call API
            const result = await completeDeck(playerTag, partialIds, selectedPlaystyle);
            setGeneratedResult(result);
            // Auto-scroll to the completed deck result
            setTimeout(() => {
                builderResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

            // Optionally fill the slots with the result? 
            // Or just show the result below using DeckDisplay?
            // Let's show DeckDisplay for the "Final Result" look.
        } catch (error) {
            console.error(error);
            alert("Failed to complete deck. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleReset = () => {
        setDeckSlots(Array(8).fill(null));
        setGeneratedResult(null);
    };

    return (
        <div className="deck-builder-container">
            <div className="builder-header">
                <h2>Deck Builder</h2>
                <p>Select cards you want, choose a style, and let AI finish the rest.</p>
            </div>

            {/* Playstyle Selector */}
            <div className="playstyle-selector">
                {PLAYSTYLES.map(style => (
                    <button
                        key={style}
                        className={`playstyle-chip ${selectedPlaystyle === style ? 'active' : ''}`}
                        onClick={() => setSelectedPlaystyle(style)}
                    >
                        {StrategyIcons[style] && <span className="style-icon">{StrategyIcons[style]}</span>}
                        {style}
                    </button>
                ))}
            </div>

            {/* Builder Grid */}
            <div className="builder-grid">
                {deckSlots.map((card, index) => {
                    // Determine empty slot styling
                    let slotStyle = "border-outline-variant/30 bg-surface-container-high text-on-surface-variant";
                    if (!card) {
                        if (index === 0) slotStyle = "border-primary/40 bg-primary/10 text-primary";
                        else if (index === 1) slotStyle = "border-secondary/40 bg-secondary/10 text-secondary";
                        else if (index === 2) slotStyle = "border-secondary/40 bg-gradient-to-r from-primary/10 to-secondary/30 text-white";
                        else slotStyle = "border-tertiary/40 bg-tertiary/10 text-tertiary";
                    }

                    return (
                        <motion.div
                            key={index}
                            className={`builder-slot border-2 border-dashed rounded-xl cursor-pointer flex justify-center items-center relative overflow-hidden transition-all duration-300 hover:scale-105 ${!card ? slotStyle + ' hover:border-white/50' : 'border-transparent bg-surface-container'}`}
                            onClick={() => handleSlotClick(index)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {card ? (
                                <>
                                    <img src={card.selectedForm === 'evolved' ? (card.imageUriEvolved || card.imageUri) : (card.isHero ? card.imageUriHero : card.imageUri)} alt={card.name} className="slot-img" />
                                    {card.selectedForm === 'evolved' && <div className="absolute top-1 left-1 bg-primary text-[8px] font-black uppercase text-on-primary px-1 rounded">Evo</div>}
                                    <button className="remove-card-btn" onClick={(e) => handleRemoveCard(e, index)}>&times;</button>
                                    <div className="slot-elixir">{card.elixirCost}</div>
                                </>
                            ) : (
                                <div className="empty-slot-content">
                                    <span className="plus-icon">+</span>
                                    <span className="slot-label">Add Card</span>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="builder-actions flex flex-col md:flex-row items-center justify-center gap-6 mt-10 mb-6">
                <button
                    className="flex items-center justify-center gap-3 bg-primary text-on-primary px-10 py-5 rounded-full font-headline font-black text-xl uppercase tracking-widest shadow-[0_0_30px_rgba(251,171,255,0.3)] hover:shadow-[0_0_50px_rgba(251,171,255,0.6)] hover:scale-105 transition-all active:scale-95 w-full md:w-auto overflow-hidden relative group disabled:opacity-75 disabled:hover:scale-100 disabled:pointer-events-none"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    {isGenerating ? (
                        <>
                            <span className="material-symbols-outlined animate-spin text-2xl">autorenew</span>
                            <span>Forging Destiny...</span>
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                            <span>Complete My Deck</span>
                        </>
                    )}
                </button>
                <button className="text-on-surface-variant font-bold hover:text-primary transition-colors hover:underline tracking-widest uppercase text-sm" onClick={handleReset}>
                    Reset Builder
                </button>
            </div>

            {/* Result Area */}
            {generatedResult && (
                <motion.div
                    ref={builderResultRef}
                    className="builder-result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <DeckDisplay deckData={generatedResult} />
                </motion.div>
            )}

            {/* Card Picker Modal */}
            <CardPicker
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelectCard={handleSelectCard}
                existingDeckIds={deckSlots.filter(c => c).map(c => c.id)}
                activeSlotIndex={activeSlotIndex}
            />
        </div>
    );
};

export default DeckBuilder;
