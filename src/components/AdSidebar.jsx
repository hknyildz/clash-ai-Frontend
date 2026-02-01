import AdBanner from './AdBanner';
import './AdSidebar.css';

const AdSidebar = ({ side }) => {
    return (
        <aside className={`ad-sidebar sidebar-${side}`}>
            <div className="sidebar-sticky-content">
                <AdBanner type="sidebar" />
            </div>
        </aside>
    );
};

export default AdSidebar;
