import { motion } from 'framer-motion';
import './Features.css';

const featureList = [
    {
        title: "Card Level Optimization",
        description: "We don't just give you a meta deck. We start with your card collection to ensure you can actually play the deck at a high level.",
    },
    {
        title: "Meta Snapshot Analysis",
        description: "Our algorithms constantly track the global leaderboard to understand which cards are performing best in the current season.",
    },
    {
        title: "Deep Leading Strategies",
        description: "Learn not just what to play, but how to play it. We identify archetype synergies like Siege, Beatdown, and Control.",
    },
    {
        title: "Safe & Secure",
        description: "We use the official Supercell API. No login required, just your public player tag.",
    }
];

const Features = () => {
    return (
        <section className="features-section">
            <h2 className="section-title">Why Use Clash Deckster?</h2>
            <div className="features-grid">
                {featureList.map((feature, index) => (
                    <motion.div
                        key={index}
                        className="feature-card glass-panel"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <h3 className="feature-title">{feature.title}</h3>
                        <p className="feature-desc">{feature.description}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Features;
