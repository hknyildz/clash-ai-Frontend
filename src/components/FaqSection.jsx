import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  { question: "Is ClashDeckster free to use?", answer: "Yes, our core AI deck building feature is 100% free to use for the entire Clash Royale community." },
  { question: "How often is the meta updated?", answer: "Because our AI evaluates the live card stats and synergies dynamically, the deck suggestions automatically adapt to the latest balance changes and meta shifts." },
  { question: "Can I use this tool for Clan Wars?", answer: "Absolutely! You can choose the 'Advanced Builder' tab to select specific playstyles and fill out your 4 distinct Clan War decks without repeating cards." }
];

const FaqSection = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleOpen = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="faq-section" style={{ marginTop: '2rem', marginBottom: '2rem', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            <h2 className="section-title" style={{ marginBottom: '2rem', textAlign: 'center' }}>Frequently Asked Questions</h2>
            <div className="faq-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', width: '100%' }}>
                {faqs.map((faq, index) => (
                    <div 
                        key={index} 
                        className="faq-item glass-panel" 
                        style={{ padding: '1rem 1.5rem', borderRadius: '12px', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}
                        onClick={() => toggleOpen(index)}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ color: '#fff', margin: 0, fontSize: '1.1rem' }}>{faq.question}</h4>
                            <span style={{ color: '#3b82f6', fontSize: '1.5rem', lineHeight: 1 }}>
                                {openIndex === index ? '−' : '+'}
                            </span>
                        </div>
                        <AnimatePresence>
                            {openIndex === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                    animate={{ height: 'auto', opacity: 1, marginTop: '1rem' }}
                                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <p style={{ color: '#cbd5e1', margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>{faq.answer}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default FaqSection;
