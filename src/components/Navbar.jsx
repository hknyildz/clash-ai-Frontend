import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';

const Navbar = ({ activeTab, onLoginClick }) => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
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
                >
                    <img src="/favicon.png" alt="ClashDeckster Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-[0_0_8px_rgba(251,171,255,0.5)]" />
                    <div className="hidden sm:block text-xl md:text-2xl font-black text-primary tracking-tighter uppercase font-headline">
                        ClashDeckster
                    </div>
                </Link>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <button
                        onClick={() => navigate('/player')}
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
                        onClick={() => navigate('/clans')}
                        className={`font-headline font-bold text-[10px] sm:text-xs uppercase tracking-wider px-3 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all duration-300 ${
                            activeTab === 'clans' || activeTab === 'clan-detail'
                                ? 'bg-primary/15 text-primary border border-primary/30'
                                : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                        }`}
                    >
                        <span className="material-symbols-outlined text-sm sm:text-base align-middle mr-0.5 sm:mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                        Clans
                    </button>

                    {/* Auth Section */}
                    {isAuthenticated ? (
                        <div className="relative ml-2" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-surface-container-high transition-all duration-300"
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
                                <span className="hidden sm:block text-xs text-on-surface-variant font-medium max-w-[100px] truncate">
                                    {user?.name}
                                </span>
                            </button>

                            {/* Dropdown */}
                            {showDropdown && (
                                <div className="absolute right-0 top-12 bg-surface-container-high border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden min-w-[200px] animate-in fade-in slide-in-from-top-2">
                                    <div className="px-4 py-3 border-b border-outline-variant/20">
                                        <p className="text-sm font-semibold text-on-surface">{user?.name}</p>
                                        <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
                                    </div>
                                    <div className="px-4 py-2 border-b border-outline-variant/20">
                                        <p className="text-xs text-on-surface-variant">
                                            Daily usage: <span className="text-primary font-bold">{user?.dailyGenerationsUsed || 0}</span>/{user?.dailyLimit || 20}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setShowDropdown(false);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm text-on-surface-variant hover:bg-surface-container hover:text-error transition-colors flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-base">logout</span>
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={onLoginClick}
                            className="ml-2 font-headline font-bold text-[10px] sm:text-xs uppercase tracking-wider px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-primary text-on-primary hover:bg-primary/80 transition-all duration-300 shadow-[0_0_12px_rgba(251,171,255,0.3)]"
                        >
                            <span className="material-symbols-outlined text-sm sm:text-base align-middle mr-0.5 sm:mr-1">login</span>
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
