import { useState } from 'react';
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
                {deckSlots.map((card, index) => (
                    <motion.div
                        key={index}
                        className={`builder-slot ${!card ? 'empty' : ''}`}
                        onClick={() => handleSlotClick(index)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {card ? (
                            <>
                                <img src={card.imageUri} alt={card.name} className="slot-img" />
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
                ))}
            </div>

            {/* Actions */}
            <div className="builder-actions">
                <button
                    className="generate-btn glow-effect"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                >
                    {isGenerating ? 'Completing Deck...' : 'Complete My Deck'}
                </button>
                <button className="text-btn reset-btn" onClick={handleReset}>Reset Builder</button>
            </div>

            {/* Result Area */}
            {generatedResult && (
                <motion.div
                    className="builder-result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h3>AI Completed Deck</h3>
                    <DeckDisplay deckData={generatedResult} />
                </motion.div>
            )}

            {/* Card Picker Modal */}
            <CardPicker
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelectCard={handleSelectCard}
                existingDeckIds={deckSlots.filter(c => c).map(c => c.id)}
            />
        </div>
    );
};

export default DeckBuilder;
