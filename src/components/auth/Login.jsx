import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SplitLayout from '../../layouts/SplitLayout';
import { FormField, AlertBox } from './AuthFormComponents';

export default function Login() {
    const navigate = useNavigate();
    const apiURL = import.meta.env.VITE_API_URL;
    const location = useLocation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false)
    const [successMessage, setSuccessMessage] = useState(location.state?.message || null);
    const [showResend, setShowResend] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (successMessage) {
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, []);

    const validateForm = () => {
        const newErrors = {};
        if (!username.trim()) newErrors.username = 'Username is required';
        if (!password) newErrors.password = 'Password is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        setSuccessMessage(null);
        setErrors({});
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            const response = await fetch(apiURL + '/login/', {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password, rememberMe }),
            });
            if (response.ok) {
                navigate('/main');
            } else if (response.status === 404) {
                throw new Error('Invalid username or password.');
            } else if (response.status === 403) {
                const data = await response.json();
                setShowResend(true);
                throw new Error(data.message || 'Please verify your email.');
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            setErrors({ general: error.message });
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        await fetch(apiURL + '/send-verification-email/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        });
        setErrors({});
        setSuccessMessage('Verification email resent! Check your inbox.');
        setShowResend(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSubmit();
    };

    return (
        <SplitLayout>
            <h2 style={styles.heading}>Welcome back!</h2>
            <p style={styles.description}>Let's get you logged in!</p>

            {errors.general && (
                <AlertBox type="error">
                    {errors.general}
                    {showResend && (
                        <button onClick={handleResend} style={styles.resendButton}>
                            Resend verification email
                        </button>
                    )}
                </AlertBox>
            )}
            {successMessage && <AlertBox type="success">{successMessage}</AlertBox>}

            <FormField
                id="username"
                label="Username"
                value={username}
                onChange={(e) => {
                    setUsername(e.target.value);
                    setShowResend(false);
                    if (errors.username) setErrors({ ...errors, username: null });
                }}
                onKeyDown={handleKeyDown}
                error={errors.username}
                disabled={isLoading}
            />
            <FormField
                id="password"
                label="Password"
                type="password"
                value={password}
                autoComplete="current-password"
                onChange={(e) => {
                    setPassword(e.target.value);
                    setShowResend(false);
                    if (errors.password) setErrors({ ...errors, password: null });
                }}
                onKeyDown={handleKeyDown}
                error={errors.password}
                disabled={isLoading}
            />

            <div style={styles.options}>
                <label style={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        style={styles.checkbox}
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span style={styles.checkboxText}>Remember me</span>
                </label>
                <Link to="/forgot-password" style={styles.link}>Forgot password?</Link>
            </div>

            <button
                onClick={handleSubmit}
                disabled={isLoading}
                style={{
                    ...styles.button,
                    opacity: isLoading ? 0.6 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
            >
                {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <p style={styles.footer}>
                Don't have an account?{' '}
                <Link to="/signup" style={styles.signupLink}>Sign up</Link>
            </p>
        </SplitLayout>
    );
}

const styles = {
    heading: {
        fontSize: '30px',
        fontWeight: 'bold',
        color: '#111827',
        margin: '0 0 8px 0',
    },
    description: {
        color: '#6b7280',
        marginBottom: '32px',
    },
    options: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
    },
    checkbox: {
        width: '16px',
        height: '16px',
        marginRight: '8px',
    },
    checkboxText: {
        fontSize: '14px',
        color: '#6b7280',
    },
    link: {
        fontSize: '14px',
        color: '#2563eb',
        textDecoration: 'none',
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
        transition: 'all 0.2s',
    },
    resendButton: {
        background: 'none',
        border: 'none',
        color: '#2563eb',
        fontSize: '14px',
        cursor: 'pointer',
        padding: '0',
        display: 'inline-block',
        textDecoration: 'underline',
        marginLeft: '10px',
    },
    footer: {
        marginTop: '32px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#6b7280',
    },
    signupLink: {
        color: '#2563eb',
        textDecoration: 'none',
        fontWeight: '500',
    },
};