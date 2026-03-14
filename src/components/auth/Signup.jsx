import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SplitLayout from '../../layouts/SplitLayout';
import { FormField } from './AuthFormComponents';

const validate = ({ email, username, password, confirmPassword }) => {
    const errors = {};

    if (!username) {
        errors.username = 'Username is required.';
    } else if (username.length < 3) {
        errors.username = 'Username must be at least 3 characters.';
    } else if (username.length > 20) {
        errors.username = 'Username must be 20 characters or fewer.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.username = 'Username can only contain letters, numbers, and underscores.';
    }

    if (!email) {
        errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
        errors.password = 'Password is required.';
    } else if (password.length < 8) {
        errors.password = 'Password must be at least 8 characters.';
    } else if (!/[A-Z]/.test(password)) {
        errors.password = 'Password must contain at least one uppercase letter.';
    } else if (!/[0-9]/.test(password)) {
        errors.password = 'Password must contain at least one number.';
    }

    if (!confirmPassword) {
        errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
    }

    return errors;
};

export default function Signup() {
    const navigate = useNavigate();
    const apiURL = import.meta.env.VITE_API_URL;
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        setErrors(validate({ email, username, password, confirmPassword }));
    };

    const handleSubmit = () => {
        setTouched({ email: true, username: true, password: true, confirmPassword: true });
        const fieldErrors = validate({ email, username, password, confirmPassword });
        setErrors(fieldErrors);
        if (Object.keys(fieldErrors).length > 0) return;

        fetch(apiURL + '/signup/', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, username, password }),
        }).then(response => {
            if (!response.ok) {
                response.json().then(data => setErrors(data));
            } else {
                navigate('/login', { state: { message: 'Signup successful! Please check your email to verify your account.' } });
            }
        });
    };

    const fieldError = (field) => touched[field] ? errors[field] : undefined;

    return (
        <SplitLayout>
            <h2 style={styles.heading}>Welcome!</h2>
            <p style={styles.description}>Let's get you started!</p>

            <FormField
                id="username"
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => handleBlur('username')}
                error={fieldError('username')}
            />
            <FormField
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                error={fieldError('email')}
            />
            <FormField
                id="password"
                label="Password"
                type="password"
                value={password}
                autoComplete="new-password"
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                error={fieldError('password')}
            />
            <FormField
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                error={fieldError('confirmPassword')}
            />

            <button onClick={handleSubmit} style={styles.button}>
                Sign Up
            </button>

            <p style={styles.footer}>
                Already have an account?{' '}
                <Link to="/login" style={styles.loginLink}>Sign In</Link>
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
        transition: 'background-color 0.2s',
        marginTop: '8px',
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