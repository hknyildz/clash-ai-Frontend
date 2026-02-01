import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const fetchFreeDeck = async (tag) => {
    // Ensure tag starts with #
    const formattedTag = tag.startsWith('#') ? tag.replace('#', '%23') : tag;
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
    try {
        const response = await api.post('/decks/complete', {
            playerTag: tag,
            partialDeck: partialDeckIds,
            playStyle: strategy
        });
        return response.data;
    } catch (error) {
        console.error("Error completing deck:", error);
        throw error;
    }
};
