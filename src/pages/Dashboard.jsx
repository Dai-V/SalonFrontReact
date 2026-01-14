import { useState } from 'react';
import NavBar from '../components/NavBar.jsx';

export default function Dashboard() {
    const [activePage, setActivePage] = useState('Dashboard');

    const handleMenuItemClick = (itemName) => {
        setActivePage(itemName);
    };

    const handleLogout = () => {

    };

    return (
        <div style={styles.container}>
            <NavBar
                activeItem={activePage}
                onMenuItemClick={handleMenuItemClick}
                onLogout={handleLogout}
            />

            <div style={styles.mainContent}>
                <div style={styles.contentHeader}>
                    <h1 style={styles.pageTitle}>{activePage}</h1>
                    <p style={styles.pageSubtitle}>Welcome to your appointment management system</p>
                </div>

                <div style={styles.contentBody}>
                    {/* Your dashboard content goes here */}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        height: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    mainContent: {
        flex: 1,
        backgroundColor: '#f9fafb',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
    },
    contentHeader: {
        padding: '20px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        marginLeft: '-1px',
    },
    pageTitle: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#111827',
        margin: '0 0 8px 0',
    },
    pageSubtitle: {
        fontSize: '16px',
        color: '#6b7280',
        margin: 0,
    },
    contentBody: {
        flex: 1,
        padding: '40px',
    },
};