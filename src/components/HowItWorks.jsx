import { motion } from 'framer-motion';
import './HowItWorks.css';

const steps = [
    {
        id: 1,
        title: "Enter Player Tag",
        description: "Input your unique Clash Royale player tag (e.g., #J08CVRJ).",
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
        </section>
    );
};

export default HowItWorks;
