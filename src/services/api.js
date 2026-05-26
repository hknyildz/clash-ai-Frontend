import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically attach auth token to all requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses (expired token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            // Dispatch custom event so AuthContext can react
            window.dispatchEvent(new CustomEvent('auth:logout'));
        }
        return Promise.reject(error);
    }
);

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

/**
 * SSE streaming deck generation.
 * Calls onDeck(deckData) for each deck as it arrives, onDone() when all are complete.
 * Returns a cleanup function to abort the connection.
 * 
 * Uses a fetch preflight to catch 429/401 errors (since EventSource can't read HTTP status).
 */
export const fetchFreeDeckStream = (tag, { onInit, onDeck, onDone, onError }) => {
    const cleanTag = tag.replace(/#/g, '');
    const formattedTag = `%23${cleanTag}`;
    const baseUrl = API_BASE_URL.replace(/\/$/, '');
    
    const token = localStorage.getItem('auth_token');
    const tokenParam = token ? `?token=${encodeURIComponent(token)}` : '';
    const url = `${baseUrl}/freeDeck/${formattedTag}/stream${tokenParam}`;

    let eventSource = null;
    let aborted = false;

    // Preflight: check rate limit with a quick fetch before opening EventSource
    fetch(url, {
        method: 'GET',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    }).then(response => {
        if (aborted) return;
        
        if (response.status === 429) {
            const error = new Error('Rate limit exceeded');
            error.status = 429;
            onError?.(error);
            return;
        }
        if (response.status === 401) {
            const error = new Error('Authentication required');
            error.status = 401;
            onError?.(error);
            return;
        }
        if (!response.ok) {
            onError?.(new Error(`HTTP ${response.status}`));
            return;
        }

        // Read the SSE stream manually from the fetch response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        function processLine(line) {
            if (line.startsWith('event:')) {
                buffer = '';
                const eventType = line.substring(6).trim();
                buffer = eventType;
            } else if (line.startsWith('data:')) {
                const data = line.substring(5).trim();
                try {
                    const parsed = JSON.parse(data);
                    if (buffer === 'init') onInit?.(parsed);
                    else if (buffer === 'deck') onDeck?.(parsed);
                    else if (buffer === 'done') onDone?.(parsed);
                    else if (buffer === 'error') onError?.(new Error(parsed.message || 'Server error'));
                } catch (err) {
                    // Non-JSON data line, skip
                }
            }
        }

        function pump() {
            return reader.read().then(({ done, value }) => {
                if (done || aborted) {
                    if (!aborted) onDone?.({});
                    return;
                }
                const text = decoder.decode(value, { stream: true });
                const lines = text.split('\n');
                for (const line of lines) {
                    if (line.trim()) processLine(line.trim());
                }
                return pump();
            });
        }

        pump().catch(err => {
            if (!aborted) onError?.(err);
        });

    }).catch(err => {
        if (!aborted) onError?.(err);
    });

    // Return cleanup function
    return () => {
        aborted = true;
        eventSource?.close();
    };
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

export const fetchTopPlayers = async (limit = 100) => {
    try {
        const response = await api.get(`/players/top?limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching top players:", error);
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
