import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { faqs } from '../data/faqs';

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
