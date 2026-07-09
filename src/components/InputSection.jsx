import { useNavigate } from 'react-router-dom';
import electroDragonImg from '../assets/chr/left/electro_dragon_dl.png';
import skeletonsImg from '../assets/chr/left/skeletons_dl.png';
import balloonImg from '../assets/chr/right/balloon_dl.png';
import dartGoblinImg from '../assets/chr/right/dart_goblin_dl.png';
import batsImg from '../assets/chr/middle/bats_dl.png';

// Discovery shortcuts — surfaced on the landing hero so mobile users find these
// pages without opening the hamburger menu.
const EXPLORE_LINKS = [
    { path: '/decks', icon: 'dashboard', label: 'Meta Decks', sub: 'Top ladder decks' },
    { path: '/cards', icon: 'style', label: 'Card Stats', sub: 'Usage & win rates' },
    { path: '/player', icon: 'query_stats', label: 'Players', sub: 'Profile lookup' },
];

const InputSection = ({ tag, setTag, onGenerate, isLoading, showButton, activeTab }) => {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (tag.trim() && showButton) {
            onGenerate(tag.trim());
        }
    };

    // Don't show input section for clans/clan-detail/stats/favorites/calculator/cards/decks tabs
    if (activeTab === 'clans' || activeTab === 'clan-detail' || activeTab === 'stats' || activeTab === 'favorites' || activeTab === 'calculator' || activeTab === 'cards' || activeTab === 'card-detail' || activeTab === 'decks') return null;

    return (
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden px-6 pt-24 pb-16">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full"></div>
            </div>

            {/* Character layer — decorative, never blocks input */}
            <div className="absolute inset-0 z-[1] pointer-events-none select-none" aria-hidden="true">
                {/* Bats — faded backdrop behind the title, all screens */}
                {/* <img
                    src={batsImg}
                    alt=""
                    className="absolute left-1/2 -translate-x-1/2 top-10 sm:top-6 w-72 sm:w-[28rem] opacity-25"
                    style={{ animation: 'float 6s ease-in-out infinite' }}
                /> */}
                {/* Desktop: Electro Dragon (left) + Balloon (right) */}
                <img
                    src={electroDragonImg}
                    alt=""
                    className="hidden md:block absolute -left-10 lg:left-0 top-1/3 w-56 lg:w-72 drop-shadow-[0_0_25px_rgba(251,171,255,0.25)]"
                    style={{ animation: 'breathe 7s ease-in-out infinite' }}
                />
                <img
                    src={balloonImg}
                    alt=""
                    className="hidden md:block absolute -right-6 lg:right-4 top-16 w-36 lg:w-48 drop-shadow-[0_0_25px_rgba(255,198,64,0.2)]"
                    style={{ animation: 'float 5s ease-in-out infinite' }}
                />
                {/* Mobile: Skeletons (left) + Dart Goblin (right) peeking from the edges */}
                <img
                    src={skeletonsImg}
                    alt=""
                    className="md:hidden absolute -left-8 top-[30%] w-32 opacity-90 drop-shadow-[0_0_18px_rgba(251,171,255,0.25)]"
                    style={{ animation: 'float 5s ease-in-out infinite' }}
                />
                <img
                    src={dartGoblinImg}
                    alt=""
                    className="md:hidden absolute -right-12 top-[16%] w-40 opacity-90 drop-shadow-[0_0_18px_rgba(255,198,64,0.2)]"
                    style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '1s' }}
                />
            </div>

            <div className="layout-container flex flex-col items-center text-center relative z-10 gap-8">
                {/* Mobile Branding */}
                <div className="sm:hidden -mt-12 text-xl font-black text-primary tracking-tighter uppercase font-headline opacity-80">
                    ClashDeckster
                </div>

                {/* Hero Title */}
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter text-white font-headline">
                    FORGE YOUR <br />
                    <span className="text-primary italic">ULTIMATE</span> <br />
                    DESTINY.
                </h1>

                <p className="hidden sm:block text-lg md:text-xl text-on-surface-variant max-w-2xl leading-relaxed px-4">
                    The Elixir Forge is open. Connect your account to analyze your playstyle and generate a data-backed deck designed for total arena domination.
                </p>

                {/* Explore shortcuts — page discovery without opening the navbar */}
                <div className="w-full max-w-lg mx-auto px-2 grid grid-cols-3 gap-2 sm:gap-3">
                    {EXPLORE_LINKS.map((link) => (
                        <button
                            key={link.path}
                            type="button"
                            onClick={() => navigate(link.path)}
                            className="group glass-panel rounded-2xl border border-outline-variant/30 py-3 px-1 flex flex-col items-center gap-1 hover:border-primary/60 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            <span
                                className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform duration-300"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                {link.icon}
                            </span>
                            <span className="font-headline font-black text-[10px] sm:text-xs uppercase tracking-wider text-white leading-tight">
                                {link.label}
                            </span>
                            <span className="hidden sm:block text-[9px] text-on-surface-variant leading-tight">
                                {link.sub}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Tactical Input Field */}
                <div className="w-full max-w-lg mx-auto px-4 flex flex-col items-center gap-4">
                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
                        <div className="relative flex items-center p-2 min-h-[64px] rounded-2xl bg-surface-container-lowest border border-outline-variant/30 focus-within:border-primary transition-all duration-300">
                            <span className="material-symbols-outlined text-outline ml-3 shrink-0">tag</span>
                            <div className="flex-1 flex items-center relative">
                                <input
                                    className="bg-transparent border-none focus:ring-0 focus:outline-none text-on-surface w-full font-headline font-bold uppercase tracking-wider placeholder:text-outline/50 px-3 py-3 text-base md:text-sm pr-10"
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

                    {/* Tabs / Mode Selector — Only Quick Generate and Builder */}
                    <div className="flex bg-surface-container-high p-1 rounded-full border border-outline-variant/20 shadow-lg">
                        <button
                            type="button"
                            className={`font-headline font-bold text-[10px] uppercase tracking-widest px-4 sm:px-6 py-2.5 rounded-full transition-all duration-300 ${activeTab === 'quick'
                                ? 'bg-primary text-on-primary shadow-[0_0_20px_rgba(251,171,255,0.4)]'
                                : 'text-on-surface-variant hover:text-primary'
                                }`}
                            onClick={() => navigate('/')}
                        >
                            <span className="hidden min-[400px]:inline">Quick&nbsp;</span>Generate
                        </button>
                        <button
                            type="button"
                            className={`font-headline font-bold text-[10px] uppercase tracking-widest px-4 sm:px-6 py-2.5 rounded-full transition-all duration-300 flex items-center gap-1 ${activeTab === 'builder'
                                ? 'bg-primary text-on-primary shadow-[0_0_20px_rgba(251,171,255,0.4)]'
                                : 'text-on-surface-variant hover:text-primary'
                                }`}
                            onClick={() => navigate('/builder')}
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

