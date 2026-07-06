import { createContext, useContext, useState, useEffect, lazy, Suspense } from 'react';
import axios from 'axios';

const LazyLoginModal = lazy(() => import('../components/LoginModal'));

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const getUrl = (path) => {
    if (!API_BASE_URL) return `/${path}`;
    return API_BASE_URL.endsWith('/') ? `${API_BASE_URL}${path}` : `${API_BASE_URL}/${path}`;
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
    const [loading, setLoading] = useState(true);

    // Login modal state
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [loginMessage, setLoginMessage] = useState('');

    // Favorites state
    const [favorites, setFavorites] = useState([]);
    const [favoritesLoading, setFavoritesLoading] = useState(false);

    const openLogin = (message) => {
        setLoginMessage(message || 'Sign in with Google to unlock premium features.');
        setLoginModalOpen(true);
    };

    const closeLogin = () => {
        setLoginModalOpen(false);
    };

    // Fetch favorites from backend
    const fetchFavorites = async (authToken) => {
        const activeToken = authToken || token;
        if (!activeToken) {
            setFavorites([]);
            return;
        }
        setFavoritesLoading(true);
        try {
            const res = await axios.get(getUrl('auth/favorites'), {
                headers: { Authorization: `Bearer ${activeToken}` }
            });
            setFavorites(res.data || []);
        } catch (err) {
            console.error('Failed to fetch favorites:', err);
        } finally {
            setFavoritesLoading(false);
        }
    };

    // On mount, verify stored token
    useEffect(() => {
        if (token) {
            axios.get(getUrl('auth/me'), {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    setUser(res.data);
                    fetchFavorites(token);
                })
                .catch(() => {
                    // Token expired or invalid
                    localStorage.removeItem('auth_token');
                    setToken(null);
                    setUser(null);
                    setFavorites([]);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (googleCredential) => {
        try {
            const res = await axios.post(getUrl('auth/google'), {
                token: googleCredential
            });
            const { user: userData, token: authToken } = res.data;
            setUser(userData);
            setToken(authToken);
            localStorage.setItem('auth_token', authToken);
            fetchFavorites(authToken);
            return userData;
        } catch (err) {
            console.error('Login failed:', err);
            throw err;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setFavorites([]);
        localStorage.removeItem('auth_token');
    };

    // Add a favorite item
    const addFavorite = async (type, targetKey, targetName, metadataJson = '') => {
        if (!user || !token) {
            openLogin('Sign in to add items to your favorites.');
            return false;
        }

        try {
            const res = await axios.post(getUrl('auth/favorites'), {
                type,
                targetKey,
                targetName,
                metadataJson
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const newFavorite = res.data;
            setFavorites(prev => {
                // Remove existing if duplicate
                const filtered = prev.filter(f => !(f.type === type && f.targetKey === targetKey));
                return [...filtered, newFavorite];
            });
            return true;
        } catch (err) {
            console.error('Failed to add favorite:', err);
            return false;
        }
    };

    // Remove a favorite item
    const removeFavorite = async (type, targetKey) => {
        if (!user || !token) {
            return false;
        }

        try {
            await axios.delete(getUrl('auth/favorites'), {
                headers: { Authorization: `Bearer ${token}` },
                params: { type, targetKey }
            });

            setFavorites(prev => prev.filter(f => !(f.type === type && f.targetKey === targetKey)));
            return true;
        } catch (err) {
            console.error('Failed to remove favorite:', err);
            return false;
        }
    };

    const value = {
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        loginModalOpen,
        loginMessage,
        openLogin,
        closeLogin,
        favorites,
        favoritesLoading,
        addFavorite,
        removeFavorite
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
            {loginModalOpen && (
                <Suspense fallback={null}>
                    <LazyLoginModal 
                        isOpen={loginModalOpen} 
                        onClose={closeLogin} 
                        message={loginMessage} 
                    />
                </Suspense>
            )}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
