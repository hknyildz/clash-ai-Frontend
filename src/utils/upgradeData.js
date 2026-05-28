/**
 * upgradeData.js — Static Rarity Upgrade Data Matrix
 *
 * Single source of all Clash Royale card upgrade requirements.
 * Key concepts:
 *   relativeLevel  — The absolute level offset where this rarity starts (Common=0, Rare=2, etc.)
 *   startLevel     — First absolute level for this rarity (relativeLevel + 1)
 *   maxLevel       — Always 16 (universal max for all rarities)
 *   upgradeMaterials[i] — Cards required for the i-th upgrade within this rarity
 *   upgradeCosts[i]     — Gold required for the i-th upgrade within this rarity
 *   upgradeExp[i]       — XP gained for the i-th upgrade within this rarity
 *   gemsPerCard — Gem cost to buy 1 card of this rarity in the shop (used for gem estimation)
 *
 * To map array index → absolute levels:
 *   Index i upgrades from (startLevel + i) to (startLevel + i + 1)
 */

export const RARITY_CONFIG = {
    common: { // --- TODO: ONLY EXP
        relativeLevel: 0,
        startLevel: 1,
        maxLevel: 16,
        gemsPerCard: 0.36,
        upgradeMaterials: [2, 4, 10, 20, 50, 100, 200, 400, 800, 1000, 1500, 2500, 3500, 5500, 7500],
        upgradeCosts: [5, 20, 50, 150, 400, 1000, 2000, 4000, 8000, 15000, 25000, 40000, 60000, 90000, 120000],
        upgradeExp: [4, 5, 14, 25, 50, 100, 200, 400, 600, 800, 1200, 2000, 3000, 50000, 200000],
    },
    rare: {
        relativeLevel: 2,
        startLevel: 3,
        maxLevel: 16,
        gemsPerCard: 2.1,
        upgradeMaterials: [2, 4, 10, 20, 50, 100, 200, 300, 400, 550, 750, 1000, 1400],
        upgradeCosts: [50, 150, 400, 1000, 2000, 4000, 8000, 15000, 25000, 40000, 60000, 90000, 120000],
        upgradeExp: [14, 25, 50, 100, 200, 400, 600, 800, 1200, 2000, 3000, 50000, 200000],
    },
    epic: {
        relativeLevel: 5,
        startLevel: 6,
        maxLevel: 16,
        gemsPerCard: 22,
        upgradeMaterials: [2, 4, 10, 20, 30, 50, 70, 100, 130, 180],
        upgradeCosts: [400, 2000, 4000, 8000, 15000, 25000, 40000, 60000, 90000, 120000],
        upgradeExp: [100, 200, 400, 600, 800, 1200, 2000, 3000, 50000, 200000],
    },
    legendary: {
        relativeLevel: 8,
        startLevel: 9,
        maxLevel: 16,
        gemsPerCard: 210,
        upgradeMaterials: [2, 4, 6, 9, 12, 14, 20],
        upgradeCosts: [5000, 15000, 25000, 40000, 60000, 90000, 120000],
        upgradeExp: [600, 800, 1200, 2000, 3000, 50000, 200000],
    },
    champion: {
        relativeLevel: 10,
        startLevel: 11,
        maxLevel: 16,
        gemsPerCard: 400,
        upgradeMaterials: [2, 5, 8, 11, 15],
        upgradeCosts: [25000, 40000, 60000, 90000, 120000],
        upgradeExp: [1200, 2000, 3000, 50000, 200000],
    },
};

/**
 * Rarity display metadata for UI rendering.
 */
export const RARITY_DISPLAY = {
    common: { label: 'Common', color: '#99ccff', sortOrder: 1 },
    rare: { label: 'Rare', color: '#ffcc66', sortOrder: 2 },
    epic: { label: 'Epic', color: '#ff99ff', sortOrder: 3 },
    legendary: { label: 'Legendary', color: '#d4a0ff', sortOrder: 4 },
    champion: { label: 'Champion', color: '#ffd700', sortOrder: 5 },
};
