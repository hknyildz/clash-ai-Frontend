import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'placeholder-client-id';

const LoginModal = ({ isOpen, onClose, message }) => {
    const { login } = useAuth();

    const handleSuccess = async (credentialResponse) => {
        try {
            await login(credentialResponse.credential);
            onClose();
        } catch (err) {
            console.error('Login error:', err);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                    <motion.div
                        className="fixed inset-0 z-[9999] flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="relative z-10 bg-surface-container-high border border-outline-variant/30 rounded-3xl p-8 max-w-md w-[90%] shadow-2xl"
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center">
                                <span
                                    className="material-symbols-outlined text-primary text-3xl"
                                    style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                    lock_open
                                </span>
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-on-surface text-center mb-2 font-headline">
                            Sign In to Continue
                        </h2>

                        {/* Message */}
                        <p className="text-on-surface-variant text-center mb-8 text-sm leading-relaxed">
                            {message || 'Sign in with Google to unlock unlimited deck generation and access all features.'}
                        </p>

                        {/* Google Sign-In Button */}
                        <div className="flex justify-center mb-6">
                            <GoogleLogin
                                onSuccess={handleSuccess}
                                onError={() => console.error('Google Login Failed')}
                                theme="filled_black"
                                size="large"
                                shape="pill"
                                text="continue_with"
                                width="300"
                            />
                        </div>

                        {/* Benefits */}
                        <div className="space-y-3 mt-6 pt-6 border-t border-outline-variant/20">
                            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                                <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                                <span>Unlimited Quick Deck Generation</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                                <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>construction</span>
                                <span>Advanced Deck Builder Access</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                                <span className="material-symbols-outlined text-tertiary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                                <span>Only your email is stored — no passwords</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
                </GoogleOAuthProvider>
            )}
        </AnimatePresence>
    );
};

export default LoginModal;
