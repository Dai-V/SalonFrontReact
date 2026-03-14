import logo from '../assets/logo.svg';

export default function SplitLayout({ children }) {
    return (
        <div style={styles.container}>
            <div style={styles.leftSide}>
                <div style={styles.brandContainer}>
                    <div style={styles.logo}>
                        <img src={logo} alt="SalonLite Logo" />
                    </div>
                    <h1 style={styles.title}>SalonLite</h1>
                    <p style={styles.subtitle}>A free appointment management app for salon managers!</p>
                </div>
            </div>
            <div style={styles.rightSide}>
                <div style={styles.formContainer}>
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
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
    },
    leftSide: {
        width: '50%',
        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        color: 'white',
    },
    brandContainer: {
        textAlign: 'center',
    },
    logo: {
        width: '96px',
        height: '96px',
        backgroundColor: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px',
    },
    title: {
        fontSize: '48px',
        fontWeight: 'bold',
        margin: '0 0 16px 0',
    },
    subtitle: {
        fontSize: '20px',
        color: '#bfdbfe',
    },
    rightSide: {
        width: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        padding: '48px',
        overflowY: 'auto',
    },
    formContainer: {
        width: '100%',
        maxWidth: '448px',
    },
};