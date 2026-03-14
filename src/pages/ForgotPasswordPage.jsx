import { useState } from 'react';
import logo from '../assets/logo.svg';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
    const apiURL = import.meta.env.VITE_API_URL;
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        setSuccessMessage(null);
        setErrors({});

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await fetch(apiURL + '/request-password-reset/', {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setSubmitted(true);
                setSuccessMessage(
                    "If an account exists for that email, you'll receive a password reset link shortly."
                );
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            setErrors({ general: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSubmit();
    };

    return (
        <div style={styles.container}>
            {/* Left Side - Brand */}
            <div style={styles.leftSide}>
                <div style={styles.brandContainer}>
                    <div style={styles.logo}>
                        <img src={logo} alt="SalonLite Logo" />
                    </div>
                    <h1 style={styles.title}>SalonLite</h1>
                    <p style={styles.subtitle}>A free appointment management app for salon managers!</p>
                </div>
            </div>

            {/* Right Side - Forgot Password Form */}
            <div style={styles.rightSide}>
                <div style={styles.formContainer}>
                    {/* Back link */}
                    <Link to="/login" style={styles.backLink}>
                        ← Back to login
                    </Link>

                    <h2 style={styles.heading}>Forgot your password?</h2>
                    <p style={styles.description}>
                        Enter your email and we'll send you a link to reset your password.
                    </p>

                    {errors.general && (
                        <div style={styles.errorBox}>{errors.general}</div>
                    )}

                    {successMessage && (
                        <div style={styles.successBox}>{successMessage}</div>
                    )}

                    {!submitted && (
                        <>
                            <div style={styles.formGroup}>
                                <label style={styles.label} htmlFor="email">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errors.email) setErrors({ ...errors, email: null });
                                    }}
                                    style={{
                                        ...styles.input,
                                        borderColor: errors.email ? '#dc2626' : '#e5e7eb',
                                    }}
                                    onKeyDown={handleKeyPress}
                                    disabled={isLoading}
                                    placeholder="you@example.com"
                                />
                                {errors.email && (
                                    <span style={styles.errorText}>{errors.email}</span>
                                )}
                            </div>

                            <button
                                onClick={handleSubmit}
                                style={{
                                    ...styles.button,
                                    opacity: isLoading ? 0.6 : 1,
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </>
                    )}

                    <p style={styles.footer}>
                        Remember your password?{' '}
                        <Link to="/login" style={styles.loginLink}>Sign in</Link>
                    </p>
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
    },
    formContainer: {
        width: '100%',
        maxWidth: '448px',
    },
    backLink: {
        display: 'inline-block',
        fontSize: '14px',
        color: '#6b7280',
        textDecoration: 'none',
        marginBottom: '24px',
    },
    heading: {
        fontSize: '30px',
        fontWeight: 'bold',
        color: '#111827',
        margin: '0 0 8px 0',
    },
    description: {
        color: '#6b7280',
        marginBottom: '32px',
        lineHeight: '1.5',
    },
    errorBox: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        marginBottom: '20px',
        border: '1px solid #fecaca',
    },
    successBox: {
        backgroundColor: '#dcfce7',
        color: '#166534',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        marginBottom: '20px',
        border: '1px solid #bbf7d0',
        lineHeight: '1.5',
    },
    formGroup: {
        marginBottom: '24px',
    },
    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '8px',
        textAlign: 'left',
    },
    input: {
        width: '100%',
        padding: '12px 16px',
        fontSize: '16px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        outline: 'none',
        transition: 'all 0.2s',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        color: '#111827',
    },
    errorText: {
        display: 'block',
        color: '#dc2626',
        fontSize: '12px',
        marginTop: '4px',
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
        transition: 'all 0.2s',
    },
    footer: {
        marginTop: '32px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#6b7280',
    },
    loginLink: {
        color: '#2563eb',
        textDecoration: 'none',
        fontWeight: '500',
    },
};