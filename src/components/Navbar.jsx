import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';

const Navbar = ({ activeTab }) => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout, openLogin } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(11,19,38,0.4)]">
            <div className="flex justify-between items-center layout-container h-20">
                <Link
                    to="/"
                    className="flex items-center gap-3 cursor-pointer no-underline"
                    onClick={() => setIsOpen(false)}
                >
                    <img src="/favicon_128x128.webp" alt="ClashDeckster Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-[0_0_8px_rgba(251,171,255,0.5)]" />
                    <div className="hidden sm:block text-xl md:text-2xl font-black text-primary tracking-tighter uppercase font-headline">
                        ClashDeckster
                    </div>
                </Link>

                {/* Desktop Tabs */}
                <div className="hidden md:flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => navigate('/player')}
                        className={`font-headline font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full transition-all duration-300 ${activeTab === 'stats'
                            ? 'bg-primary/15 text-primary border border-primary/30'
                            : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                            }`}
                    >
                        <span className="material-symbols-outlined text-base align-middle mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>query_stats</span>
                        Players
                    </button>
                    <button
                        onClick={() => navigate('/clans')}
                        className={`font-headline font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full transition-all duration-300 ${activeTab === 'clans' || activeTab === 'clan-detail'
                            ? 'bg-primary/15 text-primary border border-primary/30'
                            : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                            }`}
                    >
                        <span className="material-symbols-outlined text-base align-middle mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                        Clans
                    </button>
                    <button
                        onClick={() => navigate('/card-upgrade-calculator')}
                        className={`font-headline font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full transition-all duration-300 ${activeTab === 'calculator'
                            ? 'bg-primary/15 text-primary border border-primary/30'
                            : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                            }`}
                    >
                        <span className="material-symbols-outlined text-base align-middle mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>calculate</span>
                        Calculator
                    </button>
                </div>

                {/* Navbar Right Side */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    {/* Auth Section */}
                    {isAuthenticated ? (
                        <div className="relative ml-2" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-container-high transition-all duration-300 border border-transparent hover:border-primary/20"
                            >
                                {user?.pictureUrl ? (
                                    <img
                                        src={user.pictureUrl}
                                        alt={user.name}
                                        className="w-8 h-8 rounded-full border-2 border-primary/40 object-cover"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                        <span className="text-primary text-sm font-bold">
                                            {user?.name?.charAt(0) || '?'}
                                        </span>
                                    </div>
                                )}
                            </button>

                            {/* Dropdown */}
                            {showDropdown && (
                                <div className="absolute right-0 top-12 bg-surface-container-high border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden w-48 animate-in fade-in slide-in-from-top-2 z-50 py-1">
                                    <button
                                        onClick={() => {
                                            navigate('/favorites');
                                            setShowDropdown(false);
                                        }}
                                        className="w-full px-4 py-3 text-left text-xs text-on-surface hover:bg-surface-container-highest transition-colors flex items-center gap-2 font-headline font-bold uppercase tracking-wider"
                                    >
                                        <span className="material-symbols-outlined text-base text-primary">favorite</span>
                                        Favorites
                                    </button>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setShowDropdown(false);
                                            navigate('/');
                                        }}
                                        className="w-full px-4 py-3 text-left text-xs text-on-surface-variant hover:bg-surface-container-highest hover:text-error transition-colors flex items-center gap-2 font-headline font-bold uppercase tracking-wider"
                                    >
                                        <span className="material-symbols-outlined text-base text-error">logout</span>
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => openLogin()}
                            className="ml-2 font-headline font-bold text-[10px] sm:text-xs uppercase tracking-wider px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-primary text-on-primary hover:bg-primary/80 transition-all duration-300 shadow-[0_0_12px_rgba(251,171,255,0.3)]"
                        >
                            <span className="material-symbols-outlined text-sm sm:text-base align-middle mr-0.5 sm:mr-1">login</span>
                            Sign In
                        </button>
                    )}

                    {/* Hamburger Button for Mobile */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden flex items-center justify-center p-2 rounded-xl text-on-surface hover:bg-surface-container-high transition-colors ml-1"
                        aria-label="Toggle menu"
                    >
                        <span className="material-symbols-outlined text-2xl">
                            {isOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            {isOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-background/95 backdrop-blur-2xl border-b border-outline-variant/20 shadow-2xl py-4 px-6 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                        onClick={() => {
                            navigate('/');
                            setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-headline font-bold text-sm uppercase tracking-wider text-on-surface hover:bg-surface-container-high transition-colors text-left"
                    >
                        <span className="material-symbols-outlined text-base">home</span>
                        Home
                    </button>
                    <button
                        onClick={() => {
                            navigate('/player');
                            setIsOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-headline font-bold text-sm uppercase tracking-wider transition-colors text-left ${activeTab === 'stats'
                            ? 'bg-primary/15 text-primary'
                            : 'text-on-surface hover:bg-surface-container-high'
                            }`}
                    >
                        <span className="material-symbols-outlined text-base">query_stats</span>
                        Players
                    </button>
                    <button
                        onClick={() => {
                            navigate('/clans');
                            setIsOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-headline font-bold text-sm uppercase tracking-wider transition-colors text-left ${activeTab === 'clans' || activeTab === 'clan-detail'
                            ? 'bg-primary/15 text-primary'
                            : 'text-on-surface hover:bg-surface-container-high'
                            }`}
                    >
                        <span className="material-symbols-outlined text-base">shield</span>
                        Clans
                    </button>
                    <button
                        onClick={() => {
                            navigate('/card-upgrade-calculator');
                            setIsOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-headline font-bold text-sm uppercase tracking-wider transition-colors text-left ${activeTab === 'calculator'
                            ? 'bg-primary/15 text-primary'
                            : 'text-on-surface hover:bg-surface-container-high'
                            }`}
                    >
                        <span className="material-symbols-outlined text-base">calculate</span>
                        Card Upgrade Calculator
                    </button>

                    {isAuthenticated && (
                        <button
                            onClick={() => {
                                navigate('/favorites');
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-headline font-bold text-sm uppercase tracking-wider transition-colors text-left ${activeTab === 'favorites'
                                ? 'bg-primary/15 text-primary'
                                : 'text-on-surface hover:bg-surface-container-high'
                                }`}
                        >
                            <span className="material-symbols-outlined text-base">favorite</span>
                            Favorites
                        </button>
                    )}

                    {isAuthenticated && (
                        <button
                            onClick={() => {
                                logout();
                                setIsOpen(false);
                                navigate('/');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-headline font-bold text-sm uppercase tracking-wider text-error hover:bg-error/10 transition-colors text-left"
                        >
                            <span className="material-symbols-outlined text-base text-error">logout</span>
                            Sign Out
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
