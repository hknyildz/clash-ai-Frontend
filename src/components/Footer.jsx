import { useState } from 'react';
import './Footer.css';
import LegalModals from './LegalModals';

const Footer = () => {
    const [activeModal, setActiveModal] = useState(null);

    return (
        <footer className="app-footer">
            <div className="about-project" style={{ padding: '0 2rem 2rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem', textAlign: 'center' }}>
                <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>About the Project</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.5' }}>
                    Developed by a Senior Backend Engineer and a long-time Clash Royale veteran. This project combines LLM technology with real-time game data to help the community.
                </p>
            </div>
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

                <p className="copyright">© 2026 Clash Deckster. All rights reserved.</p>
            </div>

            {activeModal && (
                <LegalModals type={activeModal} onClose={() => setActiveModal(null)} />
            )}
        </footer>
    );
};

export default Footer;
