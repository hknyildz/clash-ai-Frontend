import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const fetchFreeDeck = async (tag) => {
    // Ensure tag starts with %23 for URL
    const cleanTag = tag.replace(/#/g, '');
    const formattedTag = `%23${cleanTag}`;
    try {
        const response = await api.get(`/freeDeck/${formattedTag}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching deck:", error);
        throw error;
    }
};

export const fetchAllCards = async () => {
    try {
        const response = await api.get('/cards');
        return response.data;
    } catch (error) {
        console.error("Error fetching all cards:", error);
        throw error;
    }
};

export const completeDeck = async (tag, partialDeckIds, strategy) => {
    // tag is optional (used for collection filtering), partialDeckIds is list of IDs
    // No URL encoding needed for JSON body
    // Ensure player tag for JSON payload includes #
    const cleanTag = tag ? tag.replace(/#/g, '') : '';
    const formattedTag = cleanTag ? `#${cleanTag}` : null;
    
    try {
        const response = await api.post('/decks/complete', {
            playerTag: formattedTag,
            partialDeck: partialDeckIds,
            playStyle: strategy
        });
        return response.data;
    } catch (error) {
        console.error("Error completing deck:", error);
        throw error;
    }
};

export const fetchPlayerStats = async (tag) => {
    const cleanTag = tag.replace(/#/g, '');
    const formattedTag = `%23${cleanTag}`;
    try {
        const response = await api.get(`/player/${formattedTag}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching player stats:", error);
        throw error;
    }
};

export const fetchClanInfo = async (clanTag) => {
    const cleanTag = clanTag.replace(/#/g, '');
    const formattedTag = `%23${cleanTag}`;
    try {
        const response = await api.get(`/clan/${formattedTag}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching clan info:", error);
        throw error;
    }
};

export const searchClans = async ({ name, minMembers, minScore, limit = 10 } = {}) => {
    try {
        const params = new URLSearchParams();
        if (name) params.append('name', name);
        if (minMembers) params.append('minMembers', minMembers);
        if (minScore) params.append('minScore', minScore);
        if (limit) params.append('limit', limit);
        const response = await api.get(`/clans?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Error searching clans:", error);
        throw error;
    }
};

export const fetchBattleLog = async (tag) => {
    const cleanTag = tag.replace(/#/g, '');
    const formattedTag = `%23${cleanTag}`;
    try {
        const response = await api.get(`/player/${formattedTag}/battlelog`);
        return response.data;
    } catch (error) {
        console.error("Error fetching battle log:", error);
        throw error;
    }
};
