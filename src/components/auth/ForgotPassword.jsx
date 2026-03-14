import { useState } from 'react';
import { Link } from 'react-router-dom';
import SplitLayout from '../../layouts/SplitLayout';
import { FormField, AlertBox } from './AuthFormComponents';

export default function ForgotPassword() {
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
                setSuccessMessage("If an account exists for that email, you'll receive a password reset link shortly.");
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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSubmit();
    };

    return (
        <SplitLayout>
            <Link to="/login" style={styles.backLink}>← Back to login</Link>
            <h2 style={styles.heading}>Forgot your password?</h2>
            <p style={styles.description}>Enter your email and we'll send you a link to reset your password.</p>

            {errors.general && <AlertBox type="error">{errors.general}</AlertBox>}
            {successMessage && <AlertBox type="success">{successMessage}</AlertBox>}

            {!submitted && (
                <>
                    <FormField
                        id="email"
                        label="Email address"
                        type="email"
                        value={email}
                        placeholder="you@example.com"
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors({ ...errors, email: null });
                        }}
                        onKeyDown={handleKeyDown}
                        error={errors.email}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        style={{
                            ...styles.button,
                            opacity: isLoading ? 0.6 : 1,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </>
            )}

            <p style={styles.footer}>
                Remember your password?{' '}
                <Link to="/login" style={styles.loginLink}>Sign in</Link>
            </p>
        </SplitLayout>
    );
}

const styles = {
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