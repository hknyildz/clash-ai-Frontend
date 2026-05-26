import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchClanInfo } from '../services/api';
import './ClanDetail.css';
import { useAuth } from '../contexts/AuthContext';

const formatLastSeen = (timeStr) => {
    if (!timeStr) return 'Unknown';
    const y = timeStr.slice(0, 4);
    const m = timeStr.slice(4, 6);
    const d = timeStr.slice(6, 8);
    return `${d}/${m}/${y}`;
};

const getRoleLabel = (role) => {
    switch (role) {
        case 'leader': return 'Leader';
        case 'coLeader': return 'Co-Leader';
        case 'elder': return 'Elder';
        default: return 'Member';
    }
};

const ClanDetail = ({ clanTag, onBack, onNavigateToPlayer }) => {
    const [clan, setClan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAllMembers, setShowAllMembers] = useState(false);
    const { favorites, addFavorite, removeFavorite } = useAuth();

    const isClanFavorited = clan?.tag
        ? favorites.some(f => f.type === 'CLAN' && f.targetKey === clan.tag)
        : false;

    const handleClanFavoriteToggle = () => {
        if (!clan?.tag) return;
        if (isClanFavorited) {
            removeFavorite('CLAN', clan.tag);
        } else {
            addFavorite('CLAN', clan.tag, clan.name || 'Unknown Clan', null);
        }
    };

    useEffect(() => {
        if (!clanTag) return;
        const load = async () => {
            setLoading(true);
            setError(null);
            setClan(null);
            try {
                const data = await fetchClanInfo(clanTag);
                if (!data || !data.tag) {
                    throw new Error('Clan not found.');
                }
                setClan(data);
            } catch (err) {
                setError(err.message || 'Failed to load clan info.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [clanTag]);

    if (loading) {
        return (
            <div className="clan-detail">
                <div className="clan-detail-loading">
                    <div className="relative w-20 h-20 mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-surface-container-highest" />
                        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="material-symbols-outlined text-secondary text-2xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                        </div>
                    </div>
                    <h3 className="text-lg font-headline font-bold text-white tracking-widest uppercase">Loading Clan...</h3>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="clan-detail ">
                <button className="clan-detail-back" onClick={onBack}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_back</span>
                    Back to Clans
                </button>
                <div className="glass-panel rounded-lg p-4 border border-error/30 text-error">{error}</div>
            </div>
        );
    }

    if (!clan) return null;

    const members = clan.memberList || [];
    const visibleMembers = showAllMembers ? members : members.slice(0, 10);
    const hasMore = members.length > 10 && !showAllMembers;

    const typeClass = clan.type === 'open' ? 'open' : clan.type === 'inviteOnly' ? 'inviteOnly' : 'closed';

    return (
        <div className="clan-detail">
            {/* Back Button */}
            <button className="clan-detail-back" onClick={onBack}>
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_back</span>
                Back to Clans
            </button>

            {/* Clan Header */}
            <motion.div
                className="clan-detail-header"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <div className="clan-detail-avatar">
                    <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                </div>
                <div className="clan-detail-info">
                    <div className="flex items-center gap-2">
                        <h2>{clan.name}</h2>
                        <button
                            onClick={handleClanFavoriteToggle}
                            className={`px-1.5 pt-1.5 rounded-full transition-all active:scale-95 border ${isClanFavorited
                                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                : 'bg-white/5 hover:bg-white/10 text-outline hover:text-rose-400 border border-white/10 hover:border-rose-500/30'
                                }`}
                            title={isClanFavorited ? "Remove Clan from Saved" : "Save Clan"}
                        >
                            <span className="material-symbols-outlined text-sm sm:text-base leading-none" style={{ fontVariationSettings: isClanFavorited ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                        </button>
                    </div>
                    <p className="clan-detail-tag">{clan.tag}</p>
                    <span className={`clan-detail-type ${typeClass}`}>
                        {clan.type === 'inviteOnly' ? 'Invite Only' : clan.type}
                    </span>
                </div>
            </motion.div>

            {/* Description */}
            {clan.description && (
                <motion.div
                    className="clan-description"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    "{clan.description}"
                </motion.div>
            )}

            {/* Stats Grid */}
            <motion.div
                className="clan-stats-grid"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
            >
                <div className="clan-stat-card">
                    <span className="clan-stat-label">Clan Score</span>
                    <span className="clan-stat-value">{(clan.clanScore || 0).toLocaleString()}</span>
                </div>
                <div className="clan-stat-card">
                    <span className="clan-stat-label">War Trophies</span>
                    <span className="clan-stat-value">{(clan.clanWarTrophies || 0).toLocaleString()}</span>
                </div>
                <div className="clan-stat-card">
                    <span className="clan-stat-label">Members</span>
                    <span className="clan-stat-value">{clan.members || members.length}</span>
                </div>
                <div className="clan-stat-card">
                    <span className="clan-stat-label">Donations/Week</span>
                    <span className="clan-stat-value">{(clan.donationsPerWeek || 0).toLocaleString()}</span>
                </div>
                <div className="clan-stat-card">
                    <span className="clan-stat-label">Required 🏆</span>
                    <span className="clan-stat-value">{(clan.requiredTrophies || 0).toLocaleString()}</span>
                </div>
            </motion.div>

            {/* Location */}
            {clan.location && (
                <motion.div
                    className="flex items-center gap-2 mb-6 text-sm text-on-surface-variant"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>location_on</span>
                    {clan.location.name}
                    {clan.location.countryCode && (
                        <span className="text-outline text-xs">({clan.location.countryCode})</span>
                    )}
                </motion.div>
            )}

            {/* Member List */}
            <div className="clan-members-section">
                <div className="clan-members-header">
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                    <h3 className="text-xs uppercase tracking-[0.2em] font-black text-tertiary">Members</h3>
                    <span className="text-[10px] text-outline uppercase tracking-widest ml-auto">{members.length} members</span>
                </div>

                {visibleMembers.map((member, i) => (
                    <motion.div
                        key={member.tag}
                        className="clan-member-row"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.03 }}
                        onClick={() => onNavigateToPlayer?.(member.tag)}
                    >
                        <div className={`clan-member-rank ${i < 3 ? 'top-3' : ''}`}>
                            {member.clanRank || i + 1}
                        </div>
                        <div className="clan-member-info">
                            <span className="clan-member-name">
                                {member.name}
                                <span className={`clan-member-role ${member.role}`}>
                                    {getRoleLabel(member.role)}
                                </span>
                            </span>
                            <span className="clan-member-meta">
                                Last seen: {formatLastSeen(member.lastSeen)}
                            </span>
                            <span className="clan-member-meta">
                                Lvl {member.expLevel}
                            </span>
                        </div>
                        <span className="clan-member-arena">{member.arena?.name}</span>
                        <div className="clan-member-trophies">
                            🏆 {member.trophies}
                        </div>
                        <span className="material-symbols-outlined text-outline" style={{ fontSize: '1rem' }}>chevron_right</span>
                    </motion.div>
                ))}

                {hasMore && (
                    <button
                        className="clan-see-more-btn"
                        onClick={() => setShowAllMembers(true)}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>expand_more</span>
                        See All {members.length} Members
                    </button>
                )}
            </div>
        </div>
    );
};

export default ClanDetail;
