export default function ErrorMessagePopup({ isOpen, onClose, title = 'Error', message }) {
    if (!isOpen) return null;

    return (
        <div style={styles.confirmOverlay} onClick={onClose}>
            <div style={styles.confirmContent} onClick={(e) => e.stopPropagation()}>
                <div style={styles.confirmTitle}>⚠ {title}</div>
                <p style={styles.confirmText}>{message}</p>
                <div style={styles.confirmButtons}>
                    <button style={styles.closeButton} onClick={onClose}>Dismiss</button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    confirmOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1003,
    },
    confirmContent: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '400px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    confirmTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#ef4444',
        margin: '0 0 12px 0',
    },
    confirmText: {
        fontSize: '14px',
        color: '#6b7280',
        margin: '0 0 24px 0',
        lineHeight: '1.5',
    },
    confirmButtons: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    closeButton: {
        backgroundColor: '#ef4444',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
};