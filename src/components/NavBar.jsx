import { useState, useEffect } from 'react';

export default function Sidebar({ onMenuItemClick, onLogout, activeItem = 'Dashboard' }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsCollapsed(true);
            } else {
                setIsCollapsed(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const menuItems = [
        { name: 'Dashboard', icon: '📊' },
        { name: 'Appointments', icon: '📅' },
        { name: 'Saved Services', icon: '👥' },
        { name: 'Technicians', icon: '👨‍🔧' },
        { name: 'Customers', icon: '👥' },
    ];

    const handleMenuClick = (itemName) => {
        if (onMenuItemClick) {
            onMenuItemClick(itemName);
        }
    };

    const handleLogout = () => {
        if (onLogout)
            onLogout()
    };

    return (
        <div style={{ ...styles.sidebar, width: isCollapsed ? '60px' : '16.66%' }}>
            {/* Header with Logo and Collapse Button */}
            <div style={styles.header}>
                {!isCollapsed && (
                    <div style={styles.logoContainer}>
                        <div style={styles.logo}>
                            <span style={styles.logoText}>S</span>
                        </div>
                        <span style={styles.brandName}>SalonLite</span>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    style={styles.collapseButton}
                >
                    {isCollapsed ? '→' : '←'}
                </button>
            </div>

            {/* Menu Items */}
            <nav style={styles.nav}>
                {menuItems.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => handleMenuClick(item.name)}
                        style={{
                            ...styles.menuItem,
                            backgroundColor: activeItem === item.name ? '#dbeafe' : 'transparent',
                        }}
                    >
                        <span style={styles.icon}>{item.icon}</span>
                        {!isCollapsed && <span style={styles.menuText}>{item.name}</span>}
                    </button>
                ))}
            </nav>

            {/* Logout Button at Bottom */}
            <div style={styles.logoutContainer}>
                <button onClick={handleLogout} style={styles.logoutButton}>
                    <span style={styles.icon}>🚪</span>
                    {!isCollapsed && <span style={styles.menuText}>Logout</span>}
                </button>
            </div>
        </div>
    );
}

const styles = {
    sidebar: {
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        height: '100vh',
    },
    header: {
        padding: '1.5rem',
        height: '3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e5e7eb',
    },
    logoContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    logo: {
        width: '2rem',
        height: '2rem',
        backgroundColor: '#2563eb',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#ffffff',
    },
    brandName: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#111827',
        whiteSpace: 'nowrap',
    },
    collapseButton: {
        backgroundColor: 'transparent',
        border: 'none',
        fontSize: '18px',
        cursor: 'pointer',
        padding: '8px',
        color: '#6b7280',
        transition: 'color 0.2s',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    nav: {
        flex: 1,
        padding: '0.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    menuItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 20px',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontSize: '15px',
        color: '#374151',
        transition: 'background-color 0.2s',
        textAlign: 'left',
        width: '100%',
        whiteSpace: 'nowrap',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    icon: {
        fontSize: '20px',
        minWidth: '20px',
        display: 'flex',
        justifyContent: 'center',
    },
    menuText: {
        fontWeight: '500',
    },
    logoutContainer: {
        padding: '20px 0',
        borderTop: '1px solid #e5e7eb',
    },
    logoutButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 20px',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontSize: '15px',
        color: '#dc2626',
        transition: 'background-color 0.2s',
        textAlign: 'left',
        width: '100%',
        whiteSpace: 'nowrap',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
};