import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SplitLayout from '../../layouts/SplitLayout';
import { FormField, AlertBox } from './AuthFormComponents.jsx';

export default function ResetPassword() {
    const apiURL = import.meta.env.VITE_API_URL;
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        if (!password) newErrors.password = 'Password is required';
        if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
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
                setSuccessMessage('Password has been reset! You will be redirected to login in a moment...');
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
            <h2 style={styles.heading}>Reset password</h2>
            <p style={styles.description}>Let's set your new password.</p>

            {errors.general && <AlertBox type="error">{errors.general}</AlertBox>}
            {successMessage && <AlertBox type="success">{successMessage}</AlertBox>}

            {!submitted && (
                <>
                    <FormField
                        id="password"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors({ ...errors, password: null });
                        }}
                        onKeyDown={handleKeyDown}
                        error={errors.password}
                        disabled={isLoading}
                    />
                    <FormField
                        id="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                        }}
                        onKeyDown={handleKeyDown}
                        error={errors.confirmPassword}
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
                        {isLoading ? 'Saving...' : 'Change Password'}
                    </button>
                </>
            )}
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
};