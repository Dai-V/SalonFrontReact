import { useState } from 'react';
import logo from '../assets/logo.svg';
import { Link, useSearchParams } from 'react-router-dom';

export default function ForgotPasswordPage() {
    const apiURL = import.meta.env.VITE_API_URL;
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [searchParams] = useSearchParams()
    const code = searchParams.get('code');
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (password != confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
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
            const response = await fetch(apiURL + '/reset-password/', {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, password }),
            });

            if (response.ok) {
                setSubmitted(true);
                setSuccessMessage(
                    "Password has been reset! You will be redirected to login in a moment..."
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

                    <h2 style={styles.heading}>Reset password</h2>
                    <p style={styles.description}>
                        Let's set your new password
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
                                <label style={styles.label} htmlFor="password">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) setErrors({ ...errors, password: null });
                                    }}
                                    style={{
                                        ...styles.input,
                                        borderColor: errors.password ? '#dc2626' : '#e5e7eb',
                                    }}
                                    onKeyDown={handleKeyPress}
                                    disabled={isLoading}
                                />
                                {errors.password && (
                                    <span style={styles.errorText}>{errors.password}</span>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label} htmlFor="confirmPassword">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                                    }}
                                    style={{
                                        ...styles.input,
                                        borderColor: errors.confirmPassword ? '#dc2626' : '#e5e7eb',
                                    }}
                                    onKeyDown={handleKeyPress}
                                    disabled={isLoading}
                                />
                                {errors.confirmPassword && (
                                    <span style={styles.errorText}>{errors.confirmPassword}</span>
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
                                {isLoading ? 'Sending...' : 'Change Password'}
                            </button>
                        </>
                    )}
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