/**
 * upgradeCalculator.js — Pure Calculation Engine for Card Upgrades
 *
 * All functions are pure (no side effects) and accept explicit inputs.
 * This module handles:
 *   1. Sequential level-up loop with card consumption
 *   2. Progression percentage calculation
 *   3. Card ranking by proximity to max
 *   4. Gold ↔ Gem conversion (reusable across the app)
 */

import { RARITY_CONFIG } from './upgradeData.js';

// ─────────────────────────────────────────────
// Gold ↔ Gem Conversion
// ─────────────────────────────────────────────

/** Default multiplier: 100,000 Gold ≈ 4,500 Gems → 0.045 gems per 1 gold */
const DEFAULT_GEMS_PER_GOLD = 0.045;

/**
 * Convert a gold amount to its gem equivalent.
 * Reusable utility — can be imported anywhere in the app.
 *
 * @param {number} goldAmount - Total gold to convert
 * @param {number} [multiplier=0.045] - Gems per 1 gold unit
 * @returns {number} Equivalent gem count (rounded up)
 */
export function goldToGems(goldAmount, multiplier = DEFAULT_GEMS_PER_GOLD) {
    if (goldAmount <= 0) return 0;
    return Math.ceil(goldAmount * multiplier);
}

/**
 * Convert a gem amount back to gold equivalent.
 *
 * @param {number} gemAmount - Total gems to convert
 * @param {number} [multiplier=0.045] - Gems per 1 gold unit
 * @returns {number} Equivalent gold count (rounded)
 */
export function gemsToGold(gemAmount, multiplier = DEFAULT_GEMS_PER_GOLD) {
    if (gemAmount <= 0 || multiplier <= 0) return 0;
    return Math.round(gemAmount / multiplier);
}

// ─────────────────────────────────────────────
// Core: Sequential Level-Up Calculation
// ─────────────────────────────────────────────

/**
 * Maps an absolute level to the upgrade array index for a given rarity.
 * The index represents the upgrade FROM this level TO the next.
 *
 * @param {string} rarity - 'common' | 'rare' | 'epic' | 'legendary' | 'champion'
 * @param {number} absoluteLevel - Absolute level (1-16)
 * @returns {number} Array index, or -1 if out of range
 */
function levelToIndex(rarity, absoluteLevel) {
    const config = RARITY_CONFIG[rarity];
    if (!config) return -1;
    const index = absoluteLevel - config.startLevel;
    if (index < 0 || index >= config.upgradeMaterials.length) return -1;
    return index;
}

/**
 * Core sequential level-up loop.
 * Walks from currentLevel to targetLevel, consuming owned cards at each step.
 * Does NOT use wild cards (per user decision — wild cards not available from API).
 *
 * @param {string} rarity - Card rarity (lowercase)
 * @param {number} currentLevel - Absolute level (1-16)
 * @param {number} targetLevel - Absolute level (> currentLevel, ≤ 16)
 * @param {number} ownedCards - User's card count for this specific card
 * @returns {UpgradeResult}
 */
export function calculateUpgrade(rarity, currentLevel, targetLevel, ownedCards) {
    const config = RARITY_CONFIG[rarity?.toLowerCase()];
    if (!config) {
        return createEmptyResult(currentLevel);
    }

    // Clamp target to valid range
    const effectiveTarget = Math.min(targetLevel, config.maxLevel);
    if (currentLevel >= effectiveTarget) {
        return createEmptyResult(currentLevel);
    }

    let remainingCards = ownedCards;
    let totalCardsNeeded = 0;
    let totalGoldNeeded = 0;
    let cardsFromOwned = 0;
    let missingCards = 0;
    let maxReachableLevel = currentLevel;
    const steps = [];

    for (let level = currentLevel; level < effectiveTarget; level++) {
        const idx = levelToIndex(rarity.toLowerCase(), level);
        if (idx === -1) break;

        const cardsNeeded = config.upgradeMaterials[idx];
        const goldNeeded = config.upgradeCosts[idx];

        // Skip levels with 0 card requirement (placeholder data)
        // but still record them as steps
        totalCardsNeeded += cardsNeeded;
        totalGoldNeeded += goldNeeded;

        const cardsConsumed = Math.min(remainingCards, cardsNeeded);
        const deficit = cardsNeeded - cardsConsumed;

        cardsFromOwned += cardsConsumed;
        missingCards += deficit;
        remainingCards -= cardsConsumed;

        const affordable = deficit === 0;
        if (affordable) {
            maxReachableLevel = level + 1;
        }

        steps.push({
            fromLevel: level,
            toLevel: level + 1,
            cardsNeeded,
            goldNeeded,
            cardsConsumed,
            deficit,
            affordable,
        });
    }

    // Estimate gem cost for missing cards using per-rarity gem pricing
    const estimatedGems = missingCards > 0
        ? Math.ceil(missingCards * (config.gemsPerCard || 0))
        : 0;

    return {
        maxReachableLevel,
        totalCardsNeeded,
        totalGoldNeeded,
        cardsFromOwned,
        missingCards,
        estimatedGems,
        remainingOwnedCards: Math.max(0, remainingCards),
        steps,
    };
}

/**
 * Creates an empty result (card already at or above target).
 */
function createEmptyResult(level) {
    return {
        maxReachableLevel: level,
        totalCardsNeeded: 0,
        totalGoldNeeded: 0,
        cardsFromOwned: 0,
        missingCards: 0,
        estimatedGems: 0,
        remainingOwnedCards: 0,
        steps: [],
    };
}

// ─────────────────────────────────────────────
// Progression Scoring & Ranking
// ─────────────────────────────────────────────

/**
 * Calculate how close a card is to max level (0-100%).
 * Considers both the level achieved AND cards already accumulated toward the next upgrade.
 *
 * @param {string} rarity - Card rarity (lowercase)
 * @param {number} currentLevel - Absolute level (1-16)
 * @param {number} ownedCards - Cards the user has for this card
 * @returns {{ percentage: number, levelsRemaining: number, totalCardsToMax: number, ownedCards: number }}
 */
export function calculateProgression(rarity, currentLevel, ownedCards) {
    const config = RARITY_CONFIG[rarity?.toLowerCase()];
    if (!config) {
        return { percentage: 0, levelsRemaining: 0, totalCardsToMax: 0, ownedCards: 0 };
    }

    const maxLevel = config.maxLevel;
    if (currentLevel >= maxLevel) {
        return { percentage: 100, levelsRemaining: 0, totalCardsToMax: 0, ownedCards };
    }

    // Total cards needed from current level to max
    let totalCardsToMax = 0;
    for (let level = currentLevel; level < maxLevel; level++) {
        const idx = levelToIndex(rarity.toLowerCase(), level);
        if (idx === -1) break;
        totalCardsToMax += config.upgradeMaterials[idx];
    }

    // Total cards needed from start level to max (for full denominator)
    let totalCardsFromStart = 0;
    for (let level = config.startLevel; level < maxLevel; level++) {
        const idx = levelToIndex(rarity.toLowerCase(), level);
        if (idx === -1) break;
        totalCardsFromStart += config.upgradeMaterials[idx];
    }

    // Cards already "spent" to reach current level
    const cardsAlreadySpent = totalCardsFromStart - totalCardsToMax;

    // Effective progress = cards spent + cards owned (capped at total needed)
    const effectiveCards = Math.min(cardsAlreadySpent + ownedCards, totalCardsFromStart);
    const percentage = totalCardsFromStart > 0
        ? (effectiveCards / totalCardsFromStart) * 100
        : 100;

    return {
        percentage: Math.min(percentage, 100),
        levelsRemaining: maxLevel - currentLevel,
        totalCardsToMax,
        ownedCards,
    };
}

/**
 * Rank all player cards by their progression percentage (closest to max first).
 * Filters out already-maxed cards from the "close to max" list.
 *
 * @param {Array} cards - Array of card objects from the Supercell API response
 *   Each card: { name, id, level, maxLevel, rarity, count, elixirCost, iconUrls, ... }
 * @param {number} [limit=5] - Number of top cards to return
 * @returns {Array<{ card: object, progression: object }>}
 */
export function rankCardsByProgression(cards, limit = 5) {
    if (!cards || cards.length === 0) return [];

    const ranked = cards
        .filter(card => card.rarity && card.level != null)
        .map(card => {
            const rarity = card.rarity.toLowerCase();
            const config = RARITY_CONFIG[rarity];
            if (!config) return null;

            // The API returns relative level, we need absolute
            const absoluteLevel = card.level + config.relativeLevel;
            const progression = calculateProgression(rarity, absoluteLevel, card.count || 0);

            return {
                card,
                absoluteLevel,
                progression,
            };
        })
        .filter(entry => entry !== null)
        // Exclude already maxed cards (100%)
        .filter(entry => entry.progression.percentage < 100)
        // Sort by highest progression first (closest to max)
        .sort((a, b) => b.progression.percentage - a.progression.percentage);

    return limit > 0 ? ranked.slice(0, limit) : ranked;
}

/**
 * Get summary stats for all cards in the collection.
 *
 * @param {Array} cards - Full card array from Supercell API
 * @returns {{ total: number, maxed: number, percentage: number }}
 */
export function getCollectionSummary(cards) {
    if (!cards || cards.length === 0) return { total: 0, maxed: 0, percentage: 0 };

    let total = 0;
    let maxed = 0;

    for (const card of cards) {
        if (!card.rarity || card.level == null) continue;
        const rarity = card.rarity.toLowerCase();
        const config = RARITY_CONFIG[rarity];
        if (!config) continue;

        total++;
        const absoluteLevel = card.level + config.relativeLevel;
        if (absoluteLevel >= config.maxLevel) {
            maxed++;
        }
    }

    return {
        total,
        maxed,
        percentage: total > 0 ? Math.round((maxed / total) * 100) : 0,
    };
}
