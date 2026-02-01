import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAllCards } from '../services/api';
import './CardPicker.css';

const RARITIES = ['All', 'Common', 'Rare', 'Epic', 'Legendary', 'Champion'];

const CardPicker = ({ isOpen, onClose, onSelectCard, existingDeckIds }) => {
    const [cards, setCards] = useState([]);
    const [filteredCards, setFilteredCards] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRarity, setSelectedRarity] = useState('All');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && cards.length === 0) {
            setLoading(true);
            fetchAllCards()
                .then(data => {
                    // Filter out duplicates if any (sometimes API returns specialized cards separately? usually fine)
                    // Sort by rarity then cost
                    const sorted = data.sort((a, b) => a.elixirCost - b.elixirCost);
                    setCards(sorted);
                    setFilteredCards(sorted);
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    useEffect(() => {
        let result = cards;

        if (searchTerm) {
            result = result.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (selectedRarity !== 'All') {
            result = result.filter(c => c.rarity === selectedRarity); // API uses "Rare", "Epic" etc capitalization? Usually yes.
        }

        setFilteredCards(result);
    }, [searchTerm, selectedRarity, cards]);

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
                            {RARITIES.map(r => (
                                <button
                                    key={r}
                                    className={`rarity-chip ${selectedRarity === r ? 'active' : ''}`}
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
                                    return (
                                        <div
                                            key={card.id}
                                            className={`picker-card-slot ${isSelected ? 'disabled' : ''}`}
                                            onClick={() => !isSelected && onSelectCard(card)}
                                        >
                                            <div className="picker-card-image-container">
                                                <img
                                                    src={card.imageUri}
                                                    alt={card.name}
                                                    loading="lazy"
                                                    className="picker-card-img"
                                                />
                                                <div className="picker-card-cost">{card.elixirCost}</div>
                                            </div>
                                            <span className="picker-card-name">{card.name}</span>
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
