import { motion, AnimatePresence } from 'framer-motion';
import './LegalModals.css';

const LegalModals = ({ type, onClose }) => {

    const content = {
        privacy: (
            <>
                <h2>Privacy Policy</h2>
                <p><strong>Last Updated: February 2026</strong></p>
                <p>We use Google Analytics and Google AdSense to improve your experience and serve relevant ads.</p>
                <h3>Data Collection</h3>
                <p>We do not collect personal data directly. However, third-party vendors, including Google, use cookies to serve ads based on your prior visits to our website or other websites.</p>
                <h3>Cookies</h3>
                <p>Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to our site and/or other sites on the Internet.</p>
                <p>You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Ads Settings</a>.</p>
            </>
        ),
        terms: (
            <>
                <h2>Terms of Service</h2>
                <p>By using this website, you agree to these terms.</p>
                <h3>1. Disclaimer</h3>
                <p>This is a fan-made tool. We are not responsible for the decks generated or your in-game results.</p>
                <h3>2. Usage</h3>
                <p>The service is provided "as is". We reserve the right to modify or discontinue the service at any time.</p>
            </>
        ),
        contact: (
            <>
                <h2>Contact</h2>
                <p>For any questions, please contact us at:</p>
                <p><a href="mailto:support@clashai-deck.com">support@clashai-deck.com</a></p>
            </>
        )
    };

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="modal-content glass-panel"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button className="close-btn" onClick={onClose}>&times;</button>
                    <div className="modal-body">
                        {content[type]}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LegalModals;
