import { motion } from 'framer-motion';

const steps = [
    {
        num: '01',
        title: 'Sync Profile',
        description: 'We pull your card levels, preferred playstyle, and win history directly from the Supercell API.',
        icon: 'database',
        accentColor: 'primary',
    },
    {
        num: '02',
        title: 'Neural Synergy',
        description: "Our engine calculates billions of deck combinations against the current ladder meta to find your perfect fit.",
        icon: 'psychology',
        accentColor: 'secondary',
        featured: true,
    },
    {
        num: '03',
        title: 'Arena Entry',
        description: 'Copy the deck directly into your game and start climbing. Real-time updates as the meta shifts.',
        icon: 'swords',
        accentColor: 'tertiary',
    },
];

const HowItWorks = () => {
    return (
        <section className="py-20 bg-surface-container-lowest/50">
            <div className="layout-container">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase mb-8 tracking-tighter font-headline">
                            THE STRATEGIST'S <span className="text-secondary">PIPELINE</span>
                        </h2>
                        <p className="text-on-surface-variant text-base leading-relaxed">
                            Leveraging real-time API data and neural deck-mapping to give you the competitive edge in the Elixir Forge.
                        </p>
                    </div>
                    <div className="h-[2px] flex-grow mx-8 bg-gradient-to-r from-primary/50 to-transparent hidden md:block"></div>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 mt-12">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.num}
                            className={`group relative overflow-hidden rounded-3xl p-10 lg:p-12 flex flex-col gap-8 hover:translate-y-[-8px] transition-transform duration-500 ${step.featured
                                ? 'bg-surface-container-highest md:scale-105 z-10 shadow-2xl'
                                : 'bg-surface-container-high'
                                }`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 }}
                        >
                            {/* Background Number */}
                            <div className={`absolute top-0 right-0 p-6 text-8xl font-black text-${step.accentColor}/5 select-none font-headline`}>
                                {step.num}
                            </div>

                            {/* Icon */}
                            <div className={`w-14 h-14 rounded-2xl bg-${step.accentColor}-container/20 flex items-center justify-center border border-${step.accentColor}/20`}>
                                <span className={`material-symbols-outlined text-${step.accentColor} text-3xl`}>{step.icon}</span>
                            </div>

                            {/* Text */}
                            <div className="mt-4">
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">{step.title}</h3>
                                <p className="text-on-surface-variant text-base leading-loose">{step.description}</p>
                            </div>

                            {/* Footer for step 3 */}
                            {step.num === '03' && (
                                <div className="mt-auto pt-4 flex justify-between items-center">
                                    <span className="text-[10px] text-tertiary font-black tracking-widest uppercase">Direct Game Link</span>
                                    <span className="material-symbols-outlined text-tertiary">arrow_forward_ios</span>
                                </div>
                            )}

                            {/* Neural synergy card visual */}
                            {step.featured && (
                                <div className="mt-auto relative h-24 w-full bg-surface-container-low rounded-xl p-4 overflow-hidden">
                                    <div className="flex gap-2 animate-pulse">
                                        <div className="w-12 h-16 bg-primary/20 rounded-md border border-primary/30"></div>
                                        <div className="w-12 h-16 bg-secondary/20 rounded-md border border-secondary/30"></div>
                                        <div className="w-12 h-16 bg-tertiary/20 rounded-md border border-tertiary/30"></div>
                                        <div className="w-12 h-16 bg-primary/20 rounded-md border border-primary/30"></div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* SEO Content */}
                <div className="glass-panel mt-32 p-10 md:p-14 rounded-[2rem] text-left leading-relaxed border border-outline-variant/10">
                    <h3 className="text-white mb-8 text-xl md:text-2xl font-bold font-headline">Why Traditional Deck Builders Fail Underleveled Players</h3>
                    <p className="text-on-surface-variant text-base md:text-lg leading-loose">
                        Most generic deck builder websites just copy-paste top ladder decks. If you try to play a 2.6 Hog Cycle deck but your Musketeer gets instantly killed by an overleveled Fireball, you will lose. ClashDeckster fundamentally changes this by <strong className="text-primary">heavily prioritizing your highest-level cards</strong>. Our AI balances perfect deck synergy with your actual level advantages, saving you from crippling ladder matchups.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
