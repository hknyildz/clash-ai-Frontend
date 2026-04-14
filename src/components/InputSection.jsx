import { useState } from 'react';

const InputSection = ({ tag, setTag, onGenerate, isLoading, showButton, activeTab, setActiveTab }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (tag.trim() && showButton) {
            onGenerate(tag.trim());
        }
    };

    return (
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden px-6 pt-24 pb-16">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full"></div>
            </div>

            <div className="layout-container flex flex-col items-center text-center relative z-10 gap-8">
                {/* Hero Title */}
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter text-white font-headline">
                    FORGE YOUR <br />
                    <span className="text-primary italic">ULTIMATE</span> <br />
                    DESTINY.
                </h1>

                <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl leading-relaxed px-4">
                    The Elixir Forge is open. Connect your account to analyze your playstyle and generate a data-backed deck designed for total arena domination.
                </p>

                {/* Tactical Input Field */}
                <div className="w-full max-w-lg mx-auto px-4 flex flex-col items-center gap-4">
                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
                        <div className="relative flex items-center p-2 min-h-[64px] rounded-2xl bg-surface-container-lowest border border-outline-variant/30 focus-within:border-primary transition-all duration-300">
                            <span className="material-symbols-outlined text-outline ml-3 shrink-0">tag</span>
                            <div className="flex-1 flex items-center relative">
                                <input
                                    className="bg-transparent border-none focus:ring-0 focus:outline-none text-on-surface w-full font-headline font-bold uppercase tracking-wider placeholder:text-outline/50 px-3 py-3 text-sm pr-10"
                                    placeholder="J08CVRJ00"
                                    type="text"
                                    value={tag}
                                    onChange={(e) => {
                                        let val = e.target.value.toUpperCase().replace(/#/g, '');
                                        setTag(val);
                                    }}
                                />
                                {tag && (
                                    <button
                                        type="button"
                                        onClick={() => setTag('')}
                                        className="absolute right-2 text-outline hover:text-primary transition-colors cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-xl">close</span>
                                    </button>
                                )}
                            </div>

                            {/* Desktop Generate Button */}
                            {showButton && (
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="hidden sm:flex bg-primary text-on-primary px-5 py-3 rounded-xl font-headline font-black uppercase text-xs tracking-tighter hover:bg-primary-container transition-colors items-center gap-2 whitespace-nowrap disabled:opacity-50 shrink-0"
                                >
                                    {isLoading ? 'Forging...' : 'Generate'}
                                    <span className="material-symbols-outlined text-sm">bolt</span>
                                </button>
                            )}
                        </div>

                        {/* Mobile Generate Button */}
                        {showButton && (
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="sm:hidden w-full bg-primary text-on-primary p-4 rounded-xl font-headline font-black uppercase text-sm tracking-widest shadow-[0_0_20px_rgba(251,171,255,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? 'Forging...' : 'Generate Deck'}
                                <span className="material-symbols-outlined text-lg">bolt</span>
                            </button>
                        )}

                        <p className="text-[10px] text-outline tracking-widest uppercase text-center">Privacy focused. No password required.</p>
                    </form>

                    {/* Tabs / Mode Selector */}
                    <div className="flex bg-surface-container-high p-1 rounded-full border border-outline-variant/20 shadow-lg">
                        <button
                            type="button"
                            className={`font-headline font-bold text-[10px] uppercase tracking-widest px-4 sm:px-8 py-2.5 rounded-full transition-all duration-300 ${activeTab === 'quick'
                                    ? 'bg-primary text-on-primary shadow-[0_0_20px_rgba(251,171,255,0.4)]'
                                    : 'text-on-surface-variant hover:text-primary'
                                }`}
                            onClick={() => setActiveTab('quick')}
                        >
                            <span className="hidden min-[400px]:inline">Quick&nbsp;</span>Generate
                        </button>
                        <button
                            type="button"
                            className={`font-headline font-bold text-[10px] uppercase tracking-widest px-4 sm:px-8 py-2.5 rounded-full transition-all duration-300 ${activeTab === 'builder'
                                    ? 'bg-primary text-on-primary shadow-[0_0_20px_rgba(251,171,255,0.4)]'
                                    : 'text-on-surface-variant hover:text-primary'
                                }`}
                            onClick={() => setActiveTab('builder')}
                        >
                            <span className="hidden min-[400px]:inline">Advanced&nbsp;</span>Builder
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InputSection;
