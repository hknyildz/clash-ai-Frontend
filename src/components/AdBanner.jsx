import './AdBanner.css';

const AdBanner = ({ type = 'banner', isLoading }) => {
    // Use 'isLoading' to trigger potential interstitial behaviors or just styling

    if (type === 'interstitial') {
        return (
            <div className="interstitial-overlay">
                <div className="interstitial-content glass-panel">
                    <p className="ad-label">Advertisement</p>
                    <div className="ad-placeholder-large">
                        {/* Interstitial Ad Content Code would go here */}
                        <span>Loading your deck...</span>
                        <div className="ad-box">AD SPACE</div>
                    </div>
                </div>
            </div>
        )
    }

    if (type === 'sidebar') {
        return (
            <div className="ad-sidebar-container">
                <div className="ad-placeholder-sidebar glass-panel">
                    <span className="ad-label">Advertisement</span>
                    <div className="ad-box">SIDEBAR AD (160x600)</div>
                </div>
            </div>
        )
    }

    return (
        <div className="ad-banner-container">
            <div className="ad-placeholder glass-panel">
                <span className="ad-label">Advertisement</span>
                {/* Banner Ad Code would go here */}
                <div className="ad-box">BANNER AD (728x90)</div>
            </div>
        </div>
    );
};

export default AdBanner;
