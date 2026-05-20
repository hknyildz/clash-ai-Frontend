import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchTopPlayers } from '../services/api';

const TopPlayers = ({ onNavigateToPlayer }) => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadTopPlayers = async () => {
            try {
                setLoading(true);
                const data = await fetchTopPlayers(100);
                setPlayers(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load top players.');
            } finally {
                setLoading(false);
            }
        };

        loadTopPlayers();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
                <p className="text-on-surface-variant text-sm uppercase tracking-widest font-bold">Loading Top Players...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-panel p-4 rounded-xl border border-error/30 text-error text-center mt-8">
                {error}
            </div>
        );
    }

    if (!players || players.length === 0) {
        return null;
    }

    return (
        <div className="mt-8">
            <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
                <h3 className="text-sm uppercase tracking-[0.2em] font-black text-white">Top 100 Global Players</h3>
                <span className="text-[10px] text-outline uppercase tracking-widest ml-auto hidden sm:block">Path of Legend</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {players.map((player, idx) => (
                    <motion.div
                        key={player.tag}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                        className="glass-panel p-3 sm:p-4 rounded-xl border border-outline-variant/20 hover:border-primary/40 flex items-center justify-between cursor-pointer transition-all hover:bg-surface-container-highest"
                        onClick={() => onNavigateToPlayer(player.tag)}
                    >
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center shrink-0">
                                <span className="text-primary font-black text-xs sm:text-sm">#{player.rank}</span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm sm:text-base font-bold text-white font-headline truncate">{player.name}</p>
                                <p className="text-[10px] sm:text-xs text-on-surface-variant font-mono">{player.tag}</p>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <div className="flex items-center gap-1 justify-end text-secondary">
                                <span className="font-black text-sm sm:text-base">{player.eloRating}</span>
                            </div>
                            <p className="text-[9px] sm:text-[10px] text-outline uppercase tracking-widest">Rating</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default TopPlayers;
