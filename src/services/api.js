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
