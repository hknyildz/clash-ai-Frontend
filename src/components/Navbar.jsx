const Navbar = () => {
    return (
        <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(11,19,38,0.4)]">
            <div className="flex justify-between items-center layout-container h-20">
                <div className="flex items-center gap-3">
                    <img src="/favicon.png" alt="ClashDeckster Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-[0_0_8px_rgba(251,171,255,0.5)]" />
                    <div className="text-2xl font-black text-primary tracking-tighter uppercase font-headline">
                        ClashDeckster
                    </div>
                </div>
                {/* 
                <div className="hidden md:flex items-center gap-8">
                    <a className="text-tertiary/70 font-headline tracking-tight hover:text-primary hover:drop-shadow-[0_0_5px_#fbabff] transition-all duration-300" href="#">Deck Builder</a>
                    <a className="text-tertiary/70 font-headline tracking-tight hover:text-primary hover:drop-shadow-[0_0_5px_#fbabff] transition-all duration-300" href="#">Meta Stats</a>
                    <a className="text-tertiary/70 font-headline tracking-tight hover:text-primary hover:drop-shadow-[0_0_5px_#fbabff] transition-all duration-300" href="#">Leaderboards</a>
                </div>
                <button className="bg-primary text-on-primary font-headline font-bold px-6 py-2.5 rounded-full active:scale-90 transition-transform elixir-glow text-sm">
                    Connect ID
                </button> 
                */}
            </div>
        </nav>
    );
};

export default Navbar;
