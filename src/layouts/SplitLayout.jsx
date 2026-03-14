import logo from '../assets/logo.svg';

export default function SplitLayout({ children }) {
    return (
        <div style={styles.container}>
            {/* Brand — left */}
            <div style={styles.brand}>
                <div style={styles.logoCircle}>
                    <img src={logo} alt="SalonLite Logo" style={styles.logoImg} />
                </div>
                <h1 style={styles.title}>SalonLite</h1>
                <p style={styles.subtitle}>A free appointment management app for salon managers!</p>
            </div>

            {/* Floating card — right */}
            <div style={styles.cardWrapper}>
                <div style={styles.card}>
                    {children}
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
        position: 'fixed',
        top: 0,
        left: 0,
        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    brand: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        color: 'white',
        textAlign: 'center',
    },
    logoCircle: {
        width: '96px',
        height: '96px',
        backgroundColor: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    },
    logoImg: {
        width: '56px',
        height: '56px',
    },
    title: {
        fontSize: '48px',
        fontWeight: 'bold',
        margin: '0 0 16px 0',
    },
    subtitle: {
        fontSize: '20px',
        color: '#bfdbfe',
        maxWidth: '320px',
        lineHeight: '1.5',
    },
    cardWrapper: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
    },
    card: {
        width: '100%',
        maxWidth: '448px',
        backgroundColor: '#f5f5f5 ',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 96px)',
    },
};