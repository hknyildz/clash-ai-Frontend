import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const faqs = {
    builder: [
        { question: "Is there an app that scans my Clash Royale profile and builds decks based on my card levels?", answer: "Yes! ClashDeckster is designed specifically for this. By entering your player tag, the tool scans your actual card levels and collection via the official API. The AI then generates the best synergy deck built around your highest-level cards, preventing you from playing underleveled cards." },
        { question: "Is ClashDeckster free to use?", answer: "Yes, our core AI deck building feature is 100% free to use for the entire Clash Royale community." },
        { question: "How often is the meta updated?", answer: "Because our AI evaluates the live card stats and synergies dynamically, the deck suggestions automatically adapt to the latest balance changes and meta shifts." },
        { question: "Can I use this tool for Clan Wars?", answer: "Absolutely! You can choose the 'Advanced Builder' tab to select specific playstyles and fill out your 4 distinct Clan War decks without repeating cards." },
        { question: "Do I need to share my password?", answer: "Never. We only use your public player tag to read your card collection via the official Supercell API. No login or password required." },
        { question: "How does the AI pick my deck?", answer: "Our system uses Large Language Models fine-tuned for Clash Royale. It analyzes your card levels, finds the strongest synergies, and builds a custom deck that maximizes your competitive advantage." },
        { question: "Why do I keep generating the same deck?", answer: "Meta data is updated daily at midnight (CET/GMT+2). Your deck is built by finding the best synergy between your current card levels and the most up-to-date meta. Until the meta shifts or your card levels change, the AI will continue to suggest the same optimal deck." }
    ],
    calculator: [
        { question: "How can I find out how much Gold, Cards, and resources I need to max my Clash Royale cards?", answer: "You can use ClashDeckster's Clash Royale Card Upgrade Calculator. It calculates the exact amount of Gold, Cards, and Gems required to level up. You can view standard base upgrade tables or search your profile tag to get a personalized calculation based on your current collection status." },
        { question: "How much gold does it cost to max a Common card in Clash Royale?", answer: "To max a Common card from Level 1 to Level 16, you need a total of 364,005 Gold across all 15 upgrade steps. The final upgrade from Level 15 to 16 alone costs 120,000 Gold." },
        { question: "How many copies do I need to max a Legendary card?", answer: "You need 67 copies of a Legendary card to go from Level 9 (starting level) to Level 16. Since Legendary cards are rare drops, this can take a very long time without trading or purchasing." },
        { question: "What is the cheapest rarity to max in Clash Royale?", answer: "Champions have the fewest total cards needed (41 cards) but high Gold costs. Common cards need the most individual cards (28,534) but each card is easy to obtain. The 'cheapest' depends on whether you value Gold or card availability more." },
        { question: "How are Gem costs estimated?", answer: "Gem costs are estimated based on the in-game shop pricing for each rarity. We calculate how many cards you are missing and multiply by the per-card gem cost for that rarity. Actual gem prices may vary depending on special offers and bundles." },
        { question: "Can I calculate upgrade costs for my own cards?", answer: "Yes! Enter your Clash Royale player tag in the search box. The calculator will load your actual card collection and show personalized upgrade costs based on your current card levels and counts." }
    ]
};

const FaqSection = ({ defaultCategory = 'builder' }) => {
    const [activeTab, setActiveTab] = useState(defaultCategory);
    const [openIndex, setOpenIndex] = useState(null);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setOpenIndex(null);
    };

    const currentFaqs = faqs[activeTab] || [];

    return (
        <section className="py-20">
            <div className="layout-container-sm">
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter font-headline text-center mb-8">
                    Frequently Asked <span className="text-primary">Questions</span>
                </h2>

                {/* Tab Switcher */}
                <div className="flex justify-center gap-2 mb-12">
                    <button
                        onClick={() => handleTabChange('builder')}
                        className={`font-headline font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full transition-all duration-300 ${
                            activeTab === 'builder'
                                ? 'bg-primary text-on-primary shadow-[0_0_20px_rgba(251,171,255,0.4)]'
                                : 'bg-surface-container-high text-on-surface-variant hover:text-primary'
                        }`}
                    >
                        AI Deck Builder
                    </button>
                    <button
                        onClick={() => handleTabChange('calculator')}
                        className={`font-headline font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full transition-all duration-300 ${
                            activeTab === 'calculator'
                                ? 'bg-primary text-on-primary shadow-[0_0_20px_rgba(251,171,255,0.4)]'
                                : 'bg-surface-container-high text-on-surface-variant hover:text-primary'
                        }`}
                    >
                        Upgrade Calculator
                    </button>
                </div>

                <div className="flex flex-col gap-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                            className="flex flex-col gap-6 w-full"
                        >
                            {currentFaqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="glass-panel rounded-3xl cursor-pointer p-8 md:p-10 w-full border border-outline-variant/20 hover:border-primary/30 transition-all"
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                >
                                    <div className="flex justify-between items-center gap-4">
                                        <h4 className="text-white font-bold text-lg leading-tight md:text-xl">{faq.question}</h4>
                                        <span className="text-primary text-3xl font-bold shrink-0 w-8 text-center flex items-center justify-center">
                                            {openIndex === index ? '−' : '+'}
                                        </span>
                                    </div>
                                    <AnimatePresence>
                                        {openIndex === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <p className="text-on-surface-variant text-base md:text-lg leading-loose mt-8 pb-2">{faq.answer}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

export default FaqSection;
