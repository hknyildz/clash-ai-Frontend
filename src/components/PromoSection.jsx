const PromoSection = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <section className="py-28">
            <div className="layout-container">
                <div className="w-full rounded-[3rem] bg-gradient-to-br from-surface-container-high to-background p-14 md:p-28 relative overflow-hidden flex flex-col items-center text-center">
                {/* Subtle radial glow */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_20%_30%,rgba(251,171,255,0.15),transparent_50%)]"></div>

                <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white max-w-4xl tracking-tighter uppercase mb-10 relative z-10 font-headline">
                    STOP GUESSING. <br />
                    START <span className="text-primary italic">WINNING.</span>
                </h2>
                <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl mb-14 relative z-10 leading-relaxed">
                    Join over 500,000 clashers who have optimized their decks with ClashDeckster's advanced Forge engine.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 relative z-10">
                    <button
                        onClick={scrollToTop}
                        className="px-10 py-5 bg-primary text-on-primary rounded-2xl font-headline font-black text-lg uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-xl elixir-glow"
                    >
                        Get Started Now
                    </button>
                    <button className="px-10 py-5 bg-surface-container-highest text-white rounded-2xl font-headline font-bold text-lg uppercase tracking-tighter border border-outline-variant/30 hover:bg-surface-bright transition-all">
                        View Meta Trends
                    </button>
                </div>

                {/* Abstract Glow */}
                <img src="/barbarian.png" alt="" className="hidden opacity-0 pointer-events-none" aria-hidden="true" />
            </div>
            </div>
        </section>
    );
};

export default PromoSection;
