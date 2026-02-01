import { useState } from 'react';
import { motion } from 'framer-motion';
import './InputSection.css';

const InputSection = ({ onGenerate, isLoading }) => {
    const [tag, setTag] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (tag.trim()) {
            onGenerate(tag.trim());
        }
    };

    return (
        <motion.div
            className="input-section glass-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <form onSubmit={handleSubmit} className="input-form">
                <label htmlFor="playerTag" className="sr-only">Player Tag</label>
                <div className="input-wrapper">
                    <input
                        type="text"
                        id="playerTag"
                        placeholder="#J08CVRJ"
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        className="player-input"
                        disabled={isLoading}
                    />
                </div>
                <button
                    type="submit"
                    className="generate-btn"
                    disabled={!tag || isLoading}
                >
                    {isLoading ? (
                        <span className="loader"></span>
                    ) : (
                        'Generate Deck'
                    )}
                </button>
            </form>
        </motion.div>
    );
};

export default InputSection;
