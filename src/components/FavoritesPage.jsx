/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './FavoritesPage.css';

const cleanDeckName = (name) => {
    if (!name) return '';
    return name.replace(/\s*\(\d+(\.\d+)?\s*🧪?\)/, '').trim();
};

const FavoritesPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, favorites, addFavorite, removeFavorite, openLogin } = useAuth();

    // Redirect guests to home and trigger login modal
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/', { replace: true });
            openLogin('Sign in to view your saved favorites.');
        }
    }, [isAuthenticated, navigate, openLogin]);

    const [expanded, setExpanded] = useState({
        players: true,
        clans: true,
        decks: true
    });

    const [editingDeckId, setEditingDeckId] = useState(null);
    const [tempDeckName, setTempDeckName] = useState('');

    const toggleSection = (section) => {
        setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleSaveRename = async (deck) => {
        if (!tempDeckName.trim()) return;
        const success = await addFavorite('DECK', deck.targetKey, tempDeckName.trim(), deck.metadataJson);
        if (success) {
            setEditingDeckId(null);
        } else {
            alert("Failed to update deck name. Please try again.");
        }
    };

    if (!isAuthenticated) return null;

    const savedPlayers = favorites.filter(f => f.type === 'PLAYER');
    const savedClans = favorites.filter(f => f.type === 'CLAN');
    const savedDecks = favorites.filter(f => f.type === 'DECK');

    const handleCopyDeckLink = (e, targetKey, towerTroopId) => {
        e.stopPropagation();
        const finalTowerTroopId = towerTroopId || '159000000';
        const copyLink = `https://link.clashroyale.com/en/?clashroyale://copyDeck?deck=${targetKey}&l=Royals&tt=${finalTowerTroopId}`;
        window.open(copyLink, '_blank');
    };

    return (
        <div className="layout-container-lg py-8 favorites-page-container">
            {/* Header */}
            <div className="favorites-header mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <span className="material-symbols-outlined text-rose-500 text-4xl mb-2 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                </span>
                <h1 className="text-3xl sm:text-4xl font-headline font-black uppercase text-white tracking-widest">
                    My Favorites
                </h1>
                <p className="text-sm text-outline mt-1 font-semibold">
                    Manage your saved players, clans, and generated deck lineups in one place.
                </p>
            </div>

            <div className="space-y-6">
                {/* 1. Saved Players Section */}
                <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-lg">
                    <button
                        onClick={() => toggleSection('players')}
                        className="w-full flex items-center justify-between p-4 sm:p-5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                            <span className="font-headline font-black uppercase tracking-wider text-sm sm:text-base text-white">Saved Players</span>
                            <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">
                                {savedPlayers.length}
                            </span>
                        </div>
                        <span className={`material-symbols-outlined text-outline transition-transform duration-300 ${expanded.players ? 'rotate-180' : ''}`}>
                            expand_more
                        </span>
                    </button>

                    <AnimatePresence initial={false}>
                        {expanded.players && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                            >
                                <div className="p-4 sm:p-5 border-t border-white/5 space-y-2">
                                    {savedPlayers.length === 0 ? (
                                        <p className="text-xs text-outline italic py-4 text-center">No saved players yet. Search for players and click the heart to save.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {savedPlayers.map(p => (
                                                <div
                                                    key={p.id}
                                                    onClick={() => navigate(`/player/${p.targetKey.replace(/#/g, '')}`)}
                                                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-primary/30 transition-all cursor-pointer group"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">
                                                            {p.targetName}
                                                        </p>
                                                        <p className="text-[10px] text-outline font-mono mt-0.5">
                                                            {p.targetKey}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeFavorite('PLAYER', p.targetKey);
                                                        }}
                                                        className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                                                        title="Remove from favorites"
                                                    >
                                                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 2. Saved Clans Section */}
                <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-lg">
                    <button
                        onClick={() => toggleSection('clans')}
                        className="w-full flex items-center justify-between p-4 sm:p-5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                            <span className="font-headline font-black uppercase tracking-wider text-sm sm:text-base text-white">Saved Clans</span>
                            <span className="text-xs bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded-full font-bold">
                                {savedClans.length}
                            </span>
                        </div>
                        <span className={`material-symbols-outlined text-outline transition-transform duration-300 ${expanded.clans ? 'rotate-180' : ''}`}>
                            expand_more
                        </span>
                    </button>

                    <AnimatePresence initial={false}>
                        {expanded.clans && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                            >
                                <div className="p-4 sm:p-5 border-t border-white/5 space-y-2">
                                    {savedClans.length === 0 ? (
                                        <p className="text-xs text-outline italic py-4 text-center">No saved clans yet. Search for clans and click the heart to save.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {savedClans.map(c => (
                                                <div
                                                    key={c.id}
                                                    onClick={() => navigate(`/clan/${c.targetKey.replace(/#/g, '')}`)}
                                                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-secondary/30 transition-all cursor-pointer group"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-white group-hover:text-secondary transition-colors truncate">
                                                            {c.targetName}
                                                        </p>
                                                        <p className="text-[10px] text-outline font-mono mt-0.5">
                                                            {c.targetKey}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeFavorite('CLAN', c.targetKey);
                                                        }}
                                                        className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                                                        title="Remove from favorites"
                                                    >
                                                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 3. Saved Decks Section */}
                <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-lg">
                    <button
                        onClick={() => toggleSection('decks')}
                        className="w-full flex items-center justify-between p-4 sm:p-5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-tertiary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>style</span>
                            <span className="font-headline font-black uppercase tracking-wider text-sm sm:text-base text-white">Saved Decks</span>
                            <span className="text-xs bg-tertiary/10 text-tertiary border border-tertiary/20 px-2 py-0.5 rounded-full font-bold">
                                {savedDecks.length}
                            </span>
                        </div>
                        <span className={`material-symbols-outlined text-outline transition-transform duration-300 ${expanded.decks ? 'rotate-180' : ''}`}>
                            expand_more
                        </span>
                    </button>

                    <AnimatePresence initial={false}>
                        {expanded.decks && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                            >
                                <div className="p-4 sm:p-5 border-t border-white/5 space-y-4">
                                    {savedDecks.length === 0 ? (
                                        <p className="text-xs text-outline italic py-4 text-center">No saved decks yet. Generate decks and click the heart to save.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {savedDecks.map(d => {
                                                let cards = [];
                                                let avgElixir = null;
                                                let towerTroopId = null;
                                                try {
                                                    if (d.metadataJson) {
                                                        const meta = JSON.parse(d.metadataJson);
                                                        cards = meta.cards || [];
                                                        avgElixir = meta.averageElixir;
                                                        towerTroopId = meta.towerTroopId;
                                                    }
                                                } catch (e) {
                                                    console.error("Error parsing deck metadata", e);
                                                }

                                                // Fallback: parse from name e.g. "Custom Deck (3.4 🧪)" or "Custom Deck (3.4)"
                                                if (!avgElixir && d.targetName) {
                                                    const match = d.targetName.match(/\((\d+(\.\d+)?)\s*(🧪)?\)/);
                                                    if (match) {
                                                        avgElixir = match[1];
                                                    }
                                                }

                                                const displayName = cleanDeckName(d.targetName);

                                                return (
                                                    <div
                                                        key={d.id}
                                                        className="p-4 rounded-md bg-white/[0.02] border border-white/5 hover:border-tertiary/30 transition-all flex flex-col gap-3 relative"
                                                    >
                                                        <div className="flex justify-between items-center w-full min-w-0 pr-20">
                                                            <div className="min-w-0 w-full">
                                                                {editingDeckId === d.id ? (
                                                                    <div className="flex items-center gap-2 w-full">
                                                                        <input
                                                                            type="text"
                                                                            value={tempDeckName}
                                                                            onChange={(e) => setTempDeckName(e.target.value)}
                                                                            className="bg-surface-container-high border border-primary/30 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-primary w-full"
                                                                            autoFocus
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') handleSaveRename(d);
                                                                                if (e.key === 'Escape') setEditingDeckId(null);
                                                                            }}
                                                                        />
                                                                        <button
                                                                            onClick={() => handleSaveRename(d)}
                                                                            className="p-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/35 transition-colors flex items-center justify-center shrink-0"
                                                                            title="Save Name"
                                                                        >
                                                                            <span className="material-symbols-outlined text-sm">check</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setEditingDeckId(null)}
                                                                            className="p-1 rounded bg-white/5 text-outline hover:text-white transition-colors flex items-center justify-center shrink-0"
                                                                            title="Cancel"
                                                                        >
                                                                            <span className="material-symbols-outlined text-sm">close</span>
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2 min-w-0 group/name">
                                                                        <span className="text-sm font-bold text-white truncate block">{displayName}</span>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setEditingDeckId(d.id);
                                                                                setTempDeckName(displayName);
                                                                            }}
                                                                            className="opacity-0 group-hover/name:opacity-100 p-0.5 rounded text-outline hover:text-primary transition-all flex items-center justify-center shrink-0"
                                                                            title="Rename Deck"
                                                                        >
                                                                            <span className="material-symbols-outlined text-[14px]">edit</span>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Deck Cards Images Row */}
                                                        {cards.length > 0 && (
                                                            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                                                                {cards.map((c, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="w-10 h-[56px] rounded bg-surface-container-low overflow-hidden shrink-0 border border-outline-variant/10 shadow-sm"
                                                                        title={c.name}
                                                                    >
                                                                        <img src={c.icon} alt={c.name} className="w-full h-full object-cover" />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Footer Row */}
                                                        <div className="flex justify-between items-center mt-auto pt-1">
                                                            <span className="text-[10px] text-outline font-semibold">Cards: {d.targetKey.split(';').length}</span>
                                                            {avgElixir && (
                                                                <span className="text-[10px] text-tertiary font-bold flex items-center gap-0.5 bg-tertiary/10 px-2 py-0.5 rounded border border-tertiary/20" title="Average Elixir Cost">
                                                                    <span className="material-symbols-outlined font-variation-fill text-xs" style={{ fontSize: '12px' }}>water_drop</span>
                                                                    {avgElixir} Avg
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="absolute top-4 right-4 flex items-center gap-1.5">
                                                            <button
                                                                onClick={(e) => handleCopyDeckLink(e, d.targetKey, towerTroopId)}
                                                                className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 transition-colors flex items-center justify-center cursor-pointer"
                                                                title="Copy Deck Link"
                                                            >
                                                                <span className="material-symbols-outlined text-base">content_copy</span>
                                                            </button>
                                                            <button
                                                                onClick={() => removeFavorite('DECK', d.targetKey)}
                                                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 transition-colors flex items-center justify-center"
                                                                title="Remove Deck"
                                                            >
                                                                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default FavoritesPage;
