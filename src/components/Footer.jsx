import { useState } from 'react';
import LegalModals from './LegalModals';

const Footer = () => {
    const [activeModal, setActiveModal] = useState(null);

    return (
        <footer className="bg-surface-container-lowest w-full pt-16 pb-10 border-t border-tertiary/10 mt-8">
            {/* About Section */}
            <div className="layout-container mb-12 text-center">
                <h4 className="text-white font-headline font-bold text-lg mb-3">About the Project</h4>
                <p className="text-tertiary/50 text-sm max-w-2xl mx-auto leading-relaxed">
                    Developed by a Senior Backend Engineer and a long-time Clash Royale veteran. This project combines LLM technology with real-time game data to help the community.
                </p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center layout-container gap-8">
                <div className="flex flex-col items-center md:items-start gap-2">
                    <div className="text-xl font-bold text-primary font-headline">ClashDeckster</div>
                    <p className="text-tertiary/50 text-sm tracking-wide">
                        © 2026 ClashDeckster. Not affiliated with Supercell.
                    </p>
                </div>
                <div className="flex gap-8 flex-wrap justify-center">
                    <button onClick={() => setActiveModal('privacy')} className="text-tertiary/50 text-sm tracking-wide hover:text-primary transition-colors">
                        Privacy Policy
                    </button>
                    <button onClick={() => setActiveModal('terms')} className="text-tertiary/50 text-sm tracking-wide hover:text-primary transition-colors">
                        Terms of Service
                    </button>
                    <button onClick={() => setActiveModal('contact')} className="text-tertiary/50 text-sm tracking-wide hover:text-primary transition-colors">
                        Contact
                    </button>
                </div>
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-tertiary/50 hover:text-primary transition-colors cursor-pointer border border-outline-variant/20">
                        <span className="material-symbols-outlined text-xl">share</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-tertiary/50 hover:text-primary transition-colors cursor-pointer border border-outline-variant/20">
                        <span className="material-symbols-outlined text-xl">chat</span>
                    </div>
                </div>
            </div>

            {/* Supercell Disclaimer */}
            <div className="layout-container mt-10 text-center">
                <p className="text-tertiary/30 text-xs leading-relaxed">
                    This content is not affiliated with, endorsed, sponsored, or specifically approved by Supercell and Supercell is not responsible for it.
                    For more information see <a href="https://supercell.com/en/fan-content-policy/" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Supercell's Fan Content Policy</a>.
                </p>
            </div>

            {activeModal && (
                <LegalModals type={activeModal} onClose={() => setActiveModal(null)} />
            )}
        </footer>
    );
};

export default Footer;
