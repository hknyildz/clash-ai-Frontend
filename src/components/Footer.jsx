import { useState } from 'react';
import './Footer.css';
import LegalModals from './LegalModals';

const Footer = () => {
    const [activeModal, setActiveModal] = useState(null);

    return (
        <footer className="app-footer">
            <div className="footer-content">
                <div className="legal-links">
                    <button onClick={() => setActiveModal('privacy')} className="legal-link">Privacy Policy</button>
                    <span className="separator">•</span>
                    <button onClick={() => setActiveModal('terms')} className="legal-link">Terms of Service</button>
                    <span className="separator">•</span>
                    <button onClick={() => setActiveModal('contact')} className="legal-link">Contact</button>
                </div>

                <div className="supercell-disclaimer">
                    <p>
                        This content is not affiliated with, endorsed, sponsored, or specifically approved by Supercell and Supercell is not responsible for it.
                        For more information see <a href="https://supercell.com/en/fan-content-policy/" target="_blank" rel="noopener noreferrer">Supercell's Fan Content Policy</a>.
                    </p>
                </div>

                <p className="copyright">© 2026 Clash AI Deck Generator. All rights reserved.</p>
            </div>

            {activeModal && (
                <LegalModals type={activeModal} onClose={() => setActiveModal(null)} />
            )}
        </footer>
    );
};

export default Footer;
