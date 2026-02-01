import { useState, useEffect } from 'react';
import './CookieBanner.css';

const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-banner glass-panel">
            <p className="cookie-text">
                We use cookies to improve your experience and analyze site traffic. By continuing, you agree to our use of cookies.
            </p>
            <button className="cookie-btn" onClick={handleAccept}>Accept</button>
        </div>
    );
};

export default CookieBanner;
