import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CardLayout from '../../layouts/CardLayout';

export default function VerifyEmail() {
    const apiURL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');
    const [status, setStatus] = useState('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!code) {
            setStatus('error');
            setErrorMessage('Invalid verification link.');
            return;
        }
        fetch(apiURL + '/verify-email/', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
            credentials: 'include',
        }).then(async response => {
            if (response.ok) {
                setStatus('success');
                setTimeout(() => {
                    navigate('/login', { state: { message: 'Email verified! You can now log in.' } });
                }, 3000);
            } else {
                const data = await response.json();
                setStatus('error');
                setErrorMessage(data.message || 'Verification failed. Please try again.');
            }
        }).catch(() => {
            setStatus('error');
            setErrorMessage('Something went wrong. Please try again.');
        });
    }, [code]);

    const goToLogin = () => navigate('/login', { state: { message: 'Email verified! You can now log in.' } });

    return (
        <CardLayout>
            {status === 'loading' && (
                <>
                    <div style={styles.spinner} />
                    <h2 style={styles.title}>Verifying your email...</h2>
                    <p style={styles.subtitle}>Please wait a moment.</p>
                </>
            )}
            {status === 'success' && (
                <>
                    <div style={styles.iconSuccess}>✓</div>
                    <h2 style={styles.title}>Email Verified!</h2>
                    <p style={styles.subtitle}>Your email has been verified. Redirecting to login...</p>
                    <button onClick={goToLogin} style={styles.button}>Go to Login</button>
                </>
            )}
            {status === 'error' && (
                <>
                    <div style={styles.iconError}>✕</div>
                    <h2 style={styles.title}>Verification Failed</h2>
                    <p style={styles.subtitle}>{errorMessage}</p>
                    <button onClick={() => navigate('/login')} style={styles.button}>Back to Login</button>
                </>
            )}
        </CardLayout>
    );
}

const styles = {
    spinner: {
        width: '48px',
        height: '48px',
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #2563eb',
        borderRadius: '50%',
        margin: '0 auto',
        animation: 'spin 1s linear infinite',
    },
    iconSuccess: {
        width: '56px',
        height: '56px',
        backgroundColor: '#dcfce7',
        color: '#16a34a',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        margin: '0 auto',
    },
    iconError: {
        width: '56px',
        height: '56px',
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        margin: '0 auto',
    },
    title: {
        fontSize: '22px',
        fontWeight: 'bold',
        color: '#111827',
        margin: '16px 0 8px',
    },
    subtitle: {
        fontSize: '15px',
        color: '#6b7280',
        margin: '0 0 24px',
        lineHeight: '1.5',
    },
    button: {
        width: '100%',
        padding: '12px',
        fontSize: '16px',
        fontWeight: '500',
        color: 'white',
        backgroundColor: '#2563eb',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
    },
};