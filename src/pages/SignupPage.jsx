import { useState } from 'react';
import logo from '../assets/logo.svg'
import { Link, useNavigate } from "react-router-dom"

const validate = ({ email, username, password, confirmPassword }) => {
    const errors = {};

    // Username: 3–20 chars, letters/numbers/underscores only
    if (!username) {
        errors.username = 'Username is required.';
    } else if (username.length < 3) {
        errors.username = 'Username must be at least 3 characters.';
    } else if (username.length > 20) {
        errors.username = 'Username must be 20 characters or fewer.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.username = 'Username can only contain letters, numbers, and underscores.';
    }

    // Email: standard format
    if (!email) {
        errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Please enter a valid email address.';
    }

    // Password: min 8 chars, at least one uppercase, one digit
    if (!password) {
        errors.password = 'Password is required.';
    } else if (password.length < 8) {
        errors.password = 'Password must be at least 8 characters.';
    } else if (!/[A-Z]/.test(password)) {
        errors.password = 'Password must contain at least one uppercase letter.';
    } else if (!/[0-9]/.test(password)) {
        errors.password = 'Password must contain at least one number.';
    }

    // Confirm password
    if (!confirmPassword) {
        errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
    }

    return errors;
};

const Field = ({ id, label, type, value, onChange, field, autoComplete, touched, errors, onBlur }) => (
    <div style={styles.formGroup}>
        <label style={styles.label} htmlFor={id}>{label}</label>
        <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => onBlur(field)}
            style={{
                ...styles.input,
                borderColor: touched[field] && errors[field] ? '#ef4444' : '#e5e7eb',
            }}
            autoComplete={autoComplete}
            required
        />
        {touched[field] && errors[field] && (
            <p style={styles.errorText}>{errors[field]}</p>
        )}
    </div>
);

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const navigate = useNavigate();
    const apiURL = import.meta.env.VITE_API_URL;

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const fieldErrors = validate({ email, username, password, confirmPassword });
        setErrors(fieldErrors);
    };

    const handleSubmit = () => {
        setTouched({ email: true, username: true, password: true, confirmPassword: true });
        const fieldErrors = validate({ email, username, password, confirmPassword });
        setErrors(fieldErrors);

        if (Object.keys(fieldErrors).length > 0) return;

        fetch(apiURL + '/signup/', {
            method: 'POST',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }),
            credentials: 'include',
            body: JSON.stringify({ email, username, password })
        }).then(response => {
            if (!response.ok) {
                const data = response.json();
                setErrors(data);
            } else {
                navigate("/login");
            }
            return response.json();
        })
    };

    return (
        <div style={styles.container}>
            {/* Left Side - Brand */}
            <div style={styles.leftSide}>
                <div style={styles.brandContainer}>
                    <div style={styles.logo}>
                        <img src={logo} alt="SalonLite logo" />
                    </div>
                    <h1 style={styles.title}>SalonLite</h1>
                    <p style={styles.subtitle}>A free appointment management app for salon managers!</p>
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div style={styles.rightSide}>
                <div style={styles.formContainer}>
                    <h2 style={styles.heading}>Welcome!</h2>
                    <p style={styles.description}>Let's get you started!</p>

                    <Field
                        id="username"
                        label="Username"
                        type="text"
                        value={username}
                        onChange={setUsername}
                        field="username"
                        touched={touched}
                        errors={errors}
                        onBlur={handleBlur}
                    />
                    <Field
                        id="email"
                        label="Email"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        field="email"
                        touched={touched}
                        errors={errors}
                        onBlur={handleBlur}
                    />
                    <Field
                        id="password"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={setPassword}
                        field="password"
                        autoComplete="new-password"
                        touched={touched}
                        errors={errors}
                        onBlur={handleBlur}
                    />
                    <Field
                        id="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        field="confirmPassword"
                        touched={touched}
                        errors={errors}
                        onBlur={handleBlur}
                    />

                    <button onClick={handleSubmit} style={styles.button}>
                        Sign Up
                    </button>

                    <p style={styles.footer}>
                        Already have an account?{' '}
                        <Link to="/login">Sign In</Link>
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
        overflowY: 'auto',
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
    formGroup: {
        marginBottom: '20px',
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
        marginTop: '6px',
        fontSize: '13px',
        color: '#ef4444',
        textAlign: 'left',
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
};