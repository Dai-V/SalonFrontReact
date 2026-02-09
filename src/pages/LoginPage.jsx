import { useState } from 'react';
import logo from '../assets/logo.svg'
import { Link, useNavigate } from "react-router-dom"

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const apiURL = import.meta.env.VITE_API_URL;

    const validateForm = () => {
        const newErrors = {};

        if (!username.trim()) {
            newErrors.username = 'Username is required';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        // Clear previous errors
        setErrors({});

        // Validate form
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        fetch(apiURL + '/login/', {
            method: 'POST',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }),
            credentials: 'include',
            body: JSON.stringify({ username: username, password: password })
        })
            .then(response => {
                if (response.ok) {
                    navigate("/main");
                    return response.json();
                } else if (response.status === 404) {
                    throw new Error('Invalid username or password');
                } else {
                    throw new Error('Something went wrong. Please try again.');
                }
            })
            .catch(error => {
                setErrors({ general: error.message });
                setIsLoading(false);
            });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
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

            {/* Right Side - Login Form */}
            <div style={styles.rightSide}>
                <div style={styles.formContainer}>
                    <h2 style={styles.heading}>Welcome back!</h2>
                    <p style={styles.description}>Let's get you logged in!</p>

                    {errors.general && (
                        <div style={styles.errorBox}>
                            {errors.general}
                        </div>
                    )}

                    <div style={styles.formGroup}>
                        <label style={styles.label} htmlFor="username">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                if (errors.username) {
                                    setErrors({ ...errors, username: null });
                                }
                            }}
                            style={{
                                ...styles.input,
                                borderColor: errors.username ? '#dc2626' : '#e5e7eb',
                            }}
                            onKeyDown={handleKeyPress}
                            disabled={isLoading}
                        />
                        {errors.username && (
                            <span style={styles.errorText}>{errors.username}</span>
                        )}
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label} htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            autoComplete="current-password"
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) {
                                    setErrors({ ...errors, password: null });
                                }
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

                    <div style={styles.options}>
                        <label style={styles.checkboxLabel}>
                            <input type="checkbox" style={styles.checkbox} />
                            <span style={styles.checkboxText}>Remember me</span>
                        </label>
                        <a href="#" style={styles.link}>
                            Forgot password?
                        </a>
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
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>

                    <p style={styles.footer}>
                        Don't have an account?{' '}
                        <Link to="/signup" style={styles.signupLink}>Sign up</Link>
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
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
    errorBox: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        marginBottom: '20px',
        border: '1px solid #fecaca',
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
        textAlign: 'left'
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
        cursor: 'pointer',
        transition: 'all 0.2s',
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