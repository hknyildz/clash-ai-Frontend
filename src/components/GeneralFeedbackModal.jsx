import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FEEDBACK_CATEGORIES = [
    { id: 'bug', label: 'Bug Report', icon: 'bug_report' },
    { id: 'feature', label: 'Feature Request', icon: 'lightbulb' },
    { id: 'deck_quality', label: 'Deck Quality', icon: 'style' },
    { id: 'ui_ux', label: 'UI / UX', icon: 'design_services' },
    { id: 'performance', label: 'Performance', icon: 'speed' },
    { id: 'other', label: 'Other', icon: 'more_horiz' },
];

const GeneralFeedbackModal = ({ isOpen, onClose }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim()) return;
        setSending(true);
        try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
            await fetch(`${API_BASE_URL}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vote: 'general',
                    reasons: selectedCategory ? [selectedCategory] : null,
                    comment: message.trim(),
                    deckJson: null,
                    strategy: null,
                    winCondition: null,
                    trophies: null,
                    playerTag: null,
                }),
            });
            setSent(true);
            setTimeout(() => {
                onClose();
                // Reset state after close animation
                setTimeout(() => {
                    setSent(false);
                    setSelectedCategory(null);
                    setMessage('');
                }, 300);
            }, 1500);
        } catch (err) {
            console.error('Failed to send feedback:', err);
        } finally {
            setSending(false);
        }
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setSent(false);
            setSelectedCategory(null);
            setMessage('');
        }, 300);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.3}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100) handleClose();
                        }}
                        className="fixed bottom-0 left-0 right-0 z-[201] max-h-[85vh] overflow-y-auto cursor-grab active:cursor-grabbing"
                    >
                        <div className="bg-surface-container-high border-t border-outline-variant/30 rounded-t-3xl shadow-[0_-16px_60px_rgba(0,0,0,0.5)]">
                            {/* Drag handle */}
                            <div className="flex justify-center pt-3 pb-2">
                                <div className="w-12 h-1.5 rounded-full bg-outline-variant/40" />
                            </div>

                            <div className="px-6 pb-8 space-y-6">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-headline font-bold text-on-surface">
                                            Send Feedback
                                        </h3>
                                        <p className="text-xs text-on-surface-variant/60 mt-0.5">
                                            Help us improve ClashDeckster
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                </div>

                                <AnimatePresence mode="wait">
                                    {!sent ? (
                                        <motion.div
                                            key="form"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="space-y-5"
                                        >
                                            {/* Category chips */}
                                            <div>
                                                <p className="text-xs text-on-surface-variant/70 uppercase tracking-widest font-headline mb-3">
                                                    Category
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {FEEDBACK_CATEGORIES.map((cat, i) => (
                                                        <motion.button
                                                            key={cat.id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.04 * i }}
                                                            onClick={() => setSelectedCategory(
                                                                selectedCategory === cat.id ? null : cat.id
                                                            )}
                                                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border active:scale-95 ${selectedCategory === cat.id
                                                                ? 'bg-primary/20 border-primary/40 text-primary shadow-[0_0_10px_rgba(251,171,255,0.15)]'
                                                                : 'bg-surface-container border-outline-variant/20 text-on-surface-variant hover:border-outline-variant/40'
                                                                }`}
                                                        >
                                                            <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                                                            {cat.label}
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Message */}
                                            <div>
                                                <p className="text-xs text-on-surface-variant/70 uppercase tracking-widest font-headline mb-3">
                                                    Message
                                                </p>
                                                <textarea
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    placeholder="Describe your feedback, suggestion, or issue..."
                                                    rows={4}
                                                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline/40 focus:outline-none focus:border-primary/50 resize-none transition-colors"
                                                />
                                            </div>

                                            {/* Submit */}
                                            <button
                                                onClick={handleSubmit}
                                                disabled={sending || !message.trim()}
                                                className="w-full py-3 rounded-xl bg-primary text-on-primary text-sm font-headline font-bold uppercase tracking-wider hover:bg-primary/80 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98] shadow-[0_0_16px_rgba(251,171,255,0.15)]"
                                            >
                                                {sending ? (
                                                    <>
                                                        <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        Send Feedback
                                                        <span className="material-symbols-outlined text-base">send</span>
                                                    </>
                                                )}
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center justify-center py-8 gap-3"
                                        >
                                            <span className="material-symbols-outlined text-4xl text-green-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                check_circle
                                            </span>
                                            <span className="text-sm font-headline font-bold uppercase tracking-widest text-on-surface">
                                                Thanks for your feedback!
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default GeneralFeedbackModal;
