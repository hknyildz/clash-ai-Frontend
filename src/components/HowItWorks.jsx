import { motion } from 'framer-motion';
import './HowItWorks.css';

const steps = [
    {
        id: 1,
        title: "Enter Player Tag",
        description: "Input your unique Clash Royale player tag (e.g., #J08CVRJ00).",
        icon: "🔍"
    },
    {
        id: 2,
        title: "AI Analysis",
        description: "Our AI scans your card collection and levels to understand your account.",
        icon: "🤖"
    },
    {
        id: 3,
        title: "Get Perfect Deck",
        description: "Receive a custom meta deck optimized for your specific card levels.",
        icon: "✨"
    }
];

const HowItWorks = () => {
    return (
        <section className="how-it-works">
            <h2 className="section-title">How It Works</h2>
            <div className="steps-container">
                {steps.map((step, index) => (
                    <motion.div
                        key={step.id}
                        className="step-card glass-panel"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2 }}
                    >
                        <div className="step-icon">{step.icon}</div>
                        <h3 className="step-title">{step.title}</h3>
                        <p className="step-desc">{step.description}</p>
                    </motion.div>
                ))}
            </div>

            <div className="seo-content glass-panel" style={{ marginTop: '4rem', padding: '2rem', textAlign: 'left', lineHeight: '1.6' }}>
                <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.5rem' }}>Why Traditional Deck Builders Fail Underleveled Players</h3>
                <p style={{ color: '#cbd5e1' }}>
                    Most generic deck builder websites just copy-paste top ladder decks. If you try to play a 2.6 Hog Cycle deck but your Musketeer gets instantly killed by an overleveled Fireball, you will lose. ClashDeckster fundamentally changes this by <strong>heavily prioritizing your highest-level cards</strong>. Our AI balances perfect deck synergy with your actual level advantages, saving you from crippling ladder matchups.
                </p>
            </div>
        </section>
    );
};

export default HowItWorks;
