import logo from '../assets/logo.svg';

export default function CardLayout({ children }) {
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.logoWrapper}>
                    <img src={logo} alt="SalonLite Logo" style={{ width: '48px', height: '48px' }} />
                </div>
                <h1 style={styles.brand}>SalonLite</h1>
                {children}
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        height: '100vh',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    },
    logoWrapper: {
        width: '72px',
        height: '72px',
        backgroundColor: '#eff6ff',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
    },
    brand: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#111827',
        margin: '0 0 32px 0',
    },
};