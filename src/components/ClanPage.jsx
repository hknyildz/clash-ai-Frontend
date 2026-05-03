import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { searchClans, fetchClanInfo } from '../services/api';
import './ClanPage.css';

const ClanPage = ({ onSelectClan }) => {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [topClans, setTopClans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [topLoading, setTopLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load top clans on mount
    useEffect(() => {
        const loadTopClans = async () => {
            setTopLoading(true);
            try {
                const data = await searchClans({ minMembers: 10, minScore: 139999, limit: 10 });
                setTopClans(data?.items || []);
            } catch (err) {
                console.error('Failed to load top clans', err);
            } finally {
                setTopLoading(false);
            }
        };
        loadTopClans();
    }, []);

    const handleSearch = async (e) => {
        e?.preventDefault();
        if (!query.trim()) return;

        const trimmed = query.trim();

        // If starts with #, it's a tag → go directly to clan detail
        if (trimmed.startsWith('#')) {
            onSelectClan?.(trimmed);
            return;
        }

        // Min 3 chars for name search
        if (trimmed.length < 3) {
            setError('Please enter at least 3 characters for name search.');
            return;
        }

        setLoading(true);
        setError(null);
        setSearchResults(null);

        try {
            const data = await searchClans({ name: trimmed, limit: 10 });
            const items = data?.items || [];
            if (items.length === 0) {
                setError('No clans found. Try a different search term.');
            }
            setSearchResults(items);
        } catch (err) {
            setError('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderClanCard = (clan, i) => (
        <motion.div
            key={clan.tag}
            className="clan-card-item"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelectClan?.(clan.tag)}
        >
            <div className="clan-card-badge">
                <span className="material-symbols-outlined text-secondary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            </div>
            <div className="clan-card-info">
                <div className="flex items-center gap-2">
                    <p className="clan-card-name">{clan.name}</p>
                    {clan.location?.name && (
                        <span className="text-[9px] uppercase tracking-wider bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded border border-outline-variant/30 flex items-center gap-0.5">
                            <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>public</span>
                            {clan.location.name}
                        </span>
                    )}
                </div>
                <p className="clan-card-tag">{clan.tag}</p>
            </div>
            <div className="clan-card-stats">
                <div className="clan-card-stat">
                    <span className="clan-card-stat-value">{(clan.clanScore || 0).toLocaleString()}</span>
                    <span className="clan-card-stat-label">Score</span>
                </div>
                <div className="clan-card-stat">
                    <span className="clan-card-stat-value">{clan.clanWarTrophies || 0}</span>
                    <span className="clan-card-stat-label">War</span>
                </div>
            </div>
            <div className="clan-card-members">
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>group</span>
                {clan.members || 0}
            </div>
            <span className="material-symbols-outlined clan-card-arrow" style={{ fontSize: '1.25rem' }}>chevron_right</span>
        </motion.div>
    );

    return (
        <div className="clan-page">
            {/* Search Section */}
            <div className="clan-search-section">
                <h1 className="clan-search-title">
                    Clan <span className="text-primary italic">Explorer</span>
                </h1>
                <p className="clan-search-subtitle">
                    Search by clan name or tag to discover and analyze any clan.
                </p>
                <form onSubmit={handleSearch} className="clan-search-bar">
                    <div className="clan-search-input-wrap">
                        <span className="material-symbols-outlined text-outline" style={{ fontSize: '1.25rem' }}>search</span>
                        <input
                            className="clan-search-input"
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="#TAG or CLAN NAME (min 3 chars)"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => { setQuery(''); setSearchResults(null); setError(null); }}
                                className="text-outline hover:text-primary transition-colors cursor-pointer"
                                style={{ background: 'none', border: 'none' }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>close</span>
                            </button>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="clan-search-btn"
                        disabled={loading || !query.trim()}
                    >
                        {loading ? (
                            <>Searching...</>
                        ) : (
                            <>
                                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>search</span>
                                Search
                            </>
                        )}
                    </button>
                </form>
                {error && <p className="clan-search-error">{error}</p>}
            </div>

            {/* Search Results */}
            {searchResults && searchResults.length > 0 && (
                <>
                    <div className="clan-section-label">
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '1rem', fontVariationSettings: "'FILL' 1" }}>manage_search</span>
                        <h3 className="text-xs uppercase tracking-[0.2em] font-black text-tertiary">Search Results</h3>
                        <span className="text-[10px] text-outline uppercase tracking-widest ml-auto">{searchResults.length} found</span>
                    </div>
                    <div className="clan-cards-list">
                        {searchResults.map((clan, i) => renderClanCard(clan, i))}
                    </div>
                </>
            )}

            {/* Top Clans */}
            {(!searchResults || searchResults.length === 0) && (
                <>
                    <div className="clan-top-separator">
                        <div className="clan-top-separator-line" />
                        <span className="clan-top-separator-text">🏆 Top Global Clans</span>
                        <div className="clan-top-separator-line" />
                    </div>

                    {topLoading ? (
                        <div className="clan-page-loading">
                            <div className="relative w-16 h-16 mb-4">
                                <div className="absolute inset-0 rounded-full border-4 border-surface-container-highest" />
                                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                            </div>
                            <p className="text-sm text-on-surface-variant">Loading top clans...</p>
                        </div>
                    ) : topClans.length > 0 ? (
                        <div className="clan-cards-list">
                            {topClans.map((clan, i) => renderClanCard(clan, i))}
                        </div>
                    ) : (
                        <p className="text-sm text-outline text-center py-8">No top clans available.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default ClanPage;
