import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DISLIKE_REASONS = [
    { id: 'low_levels', label: 'Low card levels', icon: 'trending_down' },
    { id: 'missing_cards', label: "Cards I don't own", icon: 'block' },
    { id: 'bad_synergy', label: 'Poor synergy', icon: 'link_off' },
    { id: 'wrong_archetype', label: 'Wrong archetype', icon: 'category' },
    { id: 'too_expensive', label: 'Too expensive', icon: 'local_fire_department' },
    { id: 'wrong_replacement', label: 'Wrong replacement', icon: 'swap_horiz' },
    { id: 'weak_defense', label: 'Weak deck', icon: 'shield' },
    { id: 'wrong_evo_hero', label: 'Wrong evo/hero usage', icon: 'auto_awesome' },
];

const DeckFeedback = ({ deckData, playerTag, onFeedbackSent, hasVoted }) => {
    const [vote, setVote] = useState(null);
    const [selectedReasons, setSelectedReasons] = useState([]);
    const [comment, setComment] = useState('');
    const [sending, setSending] = useState(false);
    const [feedbackId, setFeedbackId] = useState(null);
    const [detailsSent, setDetailsSent] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    // Hide if: no data, or re-visiting a voted deck (but not during active flow)
    if (!deckData || (hasVoted && vote === null) || dismissed) return null;

    const buildDeckJson = () => JSON.stringify(
        deckData.deck?.map(c => ({
            name: c.name,
            id: c.id,
            level: c.level,
            evolved: c.evolved,
            isHero: c.isHero,
        }))
    );

    const handleVote = async (type) => {
        setVote(type);
        onFeedbackSent?.(type);

        if (type === 'up') {
            setSending(true);
            await saveFeedback(type);
            setSending(false);
        } else {
            const id = await saveFeedback(type);
            if (id) setFeedbackId(id);
        }
    };

    const saveFeedback = async (voteType, reasons = [], commentText = '') => {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
            const res = await fetch(`${API_BASE_URL}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vote: voteType,
                    reasons: reasons.length > 0 ? reasons : null,
                    comment: commentText || null,
                    deckJson: buildDeckJson(),
                    strategy: deckData.strategy,
                    winCondition: deckData.winCondition,
                    trophies: deckData.trophies,
                    playerTag: playerTag || null,
                }),
            });
            const data = await res.json();
            return data.id || null;
        } catch (err) {
            console.error('Failed to send feedback:', err);
            return null;
        }
    };

    const updateFeedback = async (id, reasons, commentText) => {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
            await fetch(`${API_BASE_URL}/feedback/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reasons: reasons.length > 0 ? reasons : null,
                    comment: commentText || null,
                }),
            });
        } catch (err) {
            console.error('Failed to update feedback:', err);
        }
    };

    const toggleReason = (id) => {
        setSelectedReasons(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const handleSubmitDetails = async () => {
        setSending(true);
        if (feedbackId) {
            await updateFeedback(feedbackId, selectedReasons, comment);
        } else {
            await saveFeedback('down', selectedReasons, comment);
        }
        setSending(false);
        setDetailsSent(true);
    };

    // Determine visibility — show popup when vote is null or actively in dislike flow
    const showPopup = vote === null || (vote === 'up') || (vote === 'down' && !detailsSent);
    const showThanks = (vote === 'up') || (vote === 'down' && detailsSent);

    return (
        <>
            {/* Floating Bottom Popup */}
            <AnimatePresence>
                {showPopup && !showThanks && (
                    <motion.div
                        key="feedback-popup"
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.3}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 60) {
                                setDismissed(true);
                            }
                        }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-md cursor-grab active:cursor-grabbing"
                    >
                        {/* Drag handle */}
                        <div className="flex justify-center pb-2">
                            <div className="w-10 h-1 rounded-full bg-outline-variant/40" />
                        </div>

                        {/* Vote Buttons */}
                        {vote === null && (
                            <div className="bg-surface-container-high/95 backdrop-blur-xl border border-outline-variant/30 rounded-2xl px-5 py-4 shadow-[0_-8px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(251,171,255,0.08)] flex items-center justify-between gap-3">
                                <span className="text-xs text-on-surface-variant/70 uppercase tracking-widest font-headline">
                                    Rate this deck
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleVote('up')}
                                        className="group flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-green-500/10 border border-green-500/20 hover:border-green-400/50 hover:bg-green-500/20 transition-all duration-300 active:scale-95"
                                    >
                                        <span
                                            className="material-symbols-outlined text-lg text-green-400 transition-colors"
                                            style={{ fontVariationSettings: "'FILL' 0" }}
                                        >
                                            thumb_up
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => handleVote('down')}
                                        className="group flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-red-500/10 border border-red-500/20 hover:border-red-400/50 hover:bg-red-500/20 transition-all duration-300 active:scale-95"
                                    >
                                        <span
                                            className="material-symbols-outlined text-lg text-red-400 transition-colors"
                                            style={{ fontVariationSettings: "'FILL' 0" }}
                                        >
                                            thumb_down
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Expanded Dislike Panel */}
                        {vote === 'down' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300, delay: 0.1 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-surface-container-high/95 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-5 space-y-4 shadow-[0_-8px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(251,171,255,0.08)]">
                                    {/* Header */}
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-red-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                                            thumb_down
                                        </span>
                                        <span className="text-sm font-headline font-bold text-on-surface uppercase tracking-wider">
                                            What went wrong?
                                        </span>
                                        <span className="text-xs text-on-surface-variant/50 ml-auto">optional</span>
                                    </div>

                                    {/* Reason chips */}
                                    <div className="flex flex-wrap gap-2">
                                        {DISLIKE_REASONS.map((reason, i) => (
                                            <motion.button
                                                key={reason.id}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.05 * i }}
                                                onClick={() => toggleReason(reason.id)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border active:scale-95 ${selectedReasons.includes(reason.id)
                                                    ? 'bg-red-500/20 border-red-500/40 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.15)]'
                                                    : 'bg-surface-container border-outline-variant/20 text-on-surface-variant hover:border-outline-variant/40'
                                                    }`}
                                            >
                                                <span className="material-symbols-outlined text-sm">{reason.icon}</span>
                                                {reason.label}
                                            </motion.button>
                                        ))}
                                    </div>

                                    {/* Comment textarea */}
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Tell us more (optional)..."
                                        rows={2}
                                        className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline/40 focus:outline-none focus:border-primary/50 resize-none transition-colors"
                                    />

                                    {/* Submit button */}
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleSubmitDetails}
                                            disabled={sending}
                                            className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-xs font-headline font-bold uppercase tracking-wider hover:bg-primary/80 transition-all duration-300 disabled:opacity-50 flex items-center gap-2 active:scale-95 shadow-[0_0_12px_rgba(251,171,255,0.2)]"
                                        >
                                            {sending ? 'Sending...' : 'Submit'}
                                            <span className="material-symbols-outlined text-sm">send</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* Thank You Toast */}
                {showThanks && (
                    <motion.div
                        key="thanks-toast"
                        initial={{ y: 80, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 80, opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]"
                    >
                        <div className={`flex items-center gap-2.5 px-6 py-3 rounded-full shadow-[0_-4px_24px_rgba(0,0,0,0.3)] border ${vote === 'up'
                            ? 'bg-green-500/15 border-green-500/30 backdrop-blur-xl'
                            : 'bg-primary/15 border-primary/30 backdrop-blur-xl'
                            }`}>
                            <span
                                className={`material-symbols-outlined text-lg ${vote === 'up' ? 'text-green-400' : 'text-primary'}`}
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                {vote === 'up' ? 'thumb_up' : 'check_circle'}
                            </span>
                            <span className="text-xs font-headline uppercase tracking-widest text-on-surface">
                                Thanks for the feedback!
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default DeckFeedback;
