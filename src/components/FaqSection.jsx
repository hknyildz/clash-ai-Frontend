import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
    { question: "Is ClashDeckster free to use?", answer: "Yes, our core AI deck building feature is 100% free to use for the entire Clash Royale community." },
    { question: "How often is the meta updated?", answer: "Because our AI evaluates the live card stats and synergies dynamically, the deck suggestions automatically adapt to the latest balance changes and meta shifts." },
    { question: "Can I use this tool for Clan Wars?", answer: "Absolutely! You can choose the 'Advanced Builder' tab to select specific playstyles and fill out your 4 distinct Clan War decks without repeating cards." },
    { question: "Do I need to share my password?", answer: "Never. We only use your public player tag to read your card collection via the official Supercell API. No login or password required." },
    { question: "How does the AI pick my deck?", answer: "Our system uses Large Language Models fine-tuned for Clash Royale. It analyzes your card levels, finds the strongest synergies, and builds a custom deck that maximizes your competitive advantage." }
];

const FaqSection = () => {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <section className="py-20">
            <div className="layout-container-sm">
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter font-headline text-center mb-16">
                    Frequently Asked <span className="text-primary">Questions</span>
                </h2>
                <div className="flex flex-col gap-6">
                    {faqs.map((faq, index) => (
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
                </div>
            </div>
        </section>
    );
};

export default FaqSection;
