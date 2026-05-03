const Navbar = ({ activeTab, setActiveTab }) => {
    return (
        <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(11,19,38,0.4)]">
            <div className="flex justify-between items-center layout-container h-20">
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => setActiveTab?.('quick')}
                >
                    <img src="/favicon.png" alt="ClashDeckster Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-[0_0_8px_rgba(251,171,255,0.5)]" />
                    <div className="hidden sm:block text-xl md:text-2xl font-black text-primary tracking-tighter uppercase font-headline">
                        ClashDeckster
                    </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <button
                        onClick={() => setActiveTab?.('stats')}
                        className={`font-headline font-bold text-[10px] sm:text-xs uppercase tracking-wider px-3 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all duration-300 ${
                            activeTab === 'stats'
                                ? 'bg-primary/15 text-primary border border-primary/30'
                                : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                        }`}
                    >
                        <span className="material-symbols-outlined text-sm sm:text-base align-middle mr-0.5 sm:mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>query_stats</span>
                        <span className="hidden min-[400px]:inline">Player </span>Stats
                    </button>
                    <button
                        onClick={() => setActiveTab?.('clans')}
                        className={`font-headline font-bold text-[10px] sm:text-xs uppercase tracking-wider px-3 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all duration-300 ${
                            activeTab === 'clans' || activeTab === 'clan-detail'
                                ? 'bg-primary/15 text-primary border border-primary/30'
                                : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                        }`}
                    >
                        <span className="material-symbols-outlined text-sm sm:text-base align-middle mr-0.5 sm:mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                        Clans
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
