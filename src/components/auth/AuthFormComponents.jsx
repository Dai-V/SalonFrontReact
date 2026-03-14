// ── FormField ─────────────────────────────────────────────────────────────────
export function FormField({ id, label, type = 'text', value, onChange, onBlur, onKeyDown, error, disabled, placeholder, autoComplete }) {
    return (
        <div style={styles.formGroup}>
            <label style={styles.label} htmlFor={id}>{label}</label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                autoComplete={autoComplete}
                disabled={disabled}
                style={{ ...styles.input, borderColor: error ? '#dc2626' : '#e5e7eb' }}
            />
            {error && <span style={styles.errorText}>{error}</span>}
        </div>
    );
}

// ── AlertBox ──────────────────────────────────────────────────────────────────
export function AlertBox({ type = 'error', children }) {
    const isError = type === 'error';
    return (
        <div style={isError ? styles.errorBox : styles.successBox}>
            {children}
        </div>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
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
};