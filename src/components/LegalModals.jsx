import { motion, AnimatePresence } from 'framer-motion';
import './LegalModals.css';

const LegalModals = ({ type, onClose }) => {

    const content = {
        privacy: (
            <>
                <h2>Privacy Policy</h2>
                <p><strong>Last Updated: February 2026</strong></p>
                <p>We use Google Analytics and Google AdSense to improve your experience and serve relevant ads.</p>

                <h3>Data Collection & Cookies</h3>
                <p>We do not collect personal data directly. However, third-party vendors, including Google, use cookies to serve ads based on your prior visits to our website or other websites.</p>
                <p>Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to our site and/or other sites on the Internet.</p>

                <h3>User Rights</h3>
                <p>You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</p>
                <p>For more information on how Google uses data, please visit <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">How Google uses data when you use our partners' sites or apps</a>.</p>
            </>
        ),
        terms: (
            <>
                <h2>Terms of Service</h2>
                <p>By using <strong>ClashDeckster</strong>, you agree to comply with Supercell's Fan Content Policy.</p>
                <p>This service is an unofficial fan-made project and is not affiliated with Supercell. We provide AI-generated deck suggestions "as is" and are not responsible for in-game outcomes.</p>
            </>
        ),
        contact: (
            <>
                <h2>Contact</h2>
                <p>For any questions, please contact us at:</p>
                <p><a href="mailto:clashdeckster@gmail.com">clashdeckster@gmail.com</a></p>
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
