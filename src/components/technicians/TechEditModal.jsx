import { useState, useEffect } from 'react';
import TechHistoryModal from './TechHistoryModal.jsx';
import TechScheduleModal from './TechScheduleModal.jsx';

export default function TechEditModal({ isOpen, onClose, onSave, editTech }) {
    const [tech, setTech] = useState({
        name: '',
        email: '',
        phone: '',
        info: '',
    });

    const [errors, setErrors] = useState({});
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    // Pre-fill form when editTech changes
    useEffect(() => {
        if (editTech) {
            setTech({
                name: editTech.TechName || '',
                email: editTech.TechEmail || '',
                phone: editTech.TechPhone || '',
                info: editTech.TechInfo || '',
            });
        }
    }, [editTech]);

    const formatPhoneNumber = (value) => {
        const phoneNumber = value.replace(/\D/g, '');

        if (phoneNumber.length <= 3) {
            return phoneNumber;
        } else if (phoneNumber.length <= 6) {
            return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
        } else {
            return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleInputChange = (field, value) => {
        let formattedValue = value;
        let newErrors = { ...errors };

        if (field === 'phone') {
            formattedValue = formatPhoneNumber(value);
        }

        if (field === 'email') {
            if (value && !validateEmail(value)) {
                newErrors.email = 'Please enter a valid email address';
            } else {
                delete newErrors.email;
            }
        }

        setTech({ ...tech, [field]: formattedValue });
        setErrors(newErrors);
    };

    const handleSubmit = () => {
        let newErrors = {};

        if (tech.email && !validateEmail(tech.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSave({
            ...tech,
            techID: editTech.TechID
        });
        setErrors({});
    };

    const handleClose = () => {
        setErrors({});
        setShowHistoryModal(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div style={styles.modalOverlay} onClick={handleClose}>
                <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <div style={styles.modalHeader}>
                        <h3 style={styles.modalTitle}>Edit Tech</h3>
                        <button style={styles.closeButton} onClick={handleClose}>×</button>
                    </div>

                    <div style={styles.modalBody}>
                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Name</label>
                                <input
                                    type="text"
                                    value={tech.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    style={styles.input}
                                    placeholder="Enter full name"
                                />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email</label>
                            <input
                                type="email"
                                value={tech.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                style={{
                                    ...styles.input,
                                    borderColor: errors.email ? '#dc2626' : '#e5e7eb',
                                }}
                                placeholder="tech@email.com"
                            />
                            {errors.email && (
                                <span style={styles.errorText}>{errors.email}</span>
                            )}
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Phone</label>
                            <input
                                type="tel"
                                value={tech.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                style={styles.input}
                                placeholder="(555) 123-4567"
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Additional Information</label>
                            <textarea
                                value={tech.info}
                                onChange={(e) => handleInputChange('info', e.target.value)}
                                style={styles.textarea}
                                placeholder="Any additional information about the tech"
                                rows="3"
                            />
                        </div>
                    </div>

                    <div style={styles.modalFooter}>
                        <button
                            style={styles.historyButton}
                            onClick={() => setShowHistoryModal(true)}
                        >
                            📋View History
                        </button>
                        <button
                            style={styles.historyButton}
                            onClick={() => setShowScheduleModal(true)}
                        >
                            📅View Schedule
                        </button>
                        <div style={styles.footerRight}>
                            <button style={styles.cancelButton} onClick={handleClose}>
                                Cancel
                            </button>
                            <button style={styles.saveButton} onClick={handleSubmit}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <TechHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                techID={editTech?.TechID}
            />
            <TechScheduleModal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                techID={editTech?.TechID}
            />
        </>
    );
}

const styles = {
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 24px 16px 24px',
        borderBottom: '1px solid #e5e7eb',
    },
    modalTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#111827',
        margin: 0,
    },
    closeButton: {
        backgroundColor: 'transparent',
        border: 'none',
        fontSize: '32px',
        color: '#6b7280',
        cursor: 'pointer',
        lineHeight: '1',
        padding: 0,
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    modalBody: {
        padding: '24px',
        maxHeight: '60vh',
        overflowY: 'auto',
    },
    formRow: {
        display: 'flex',
        gap: '16px',
        marginBottom: '20px',
    },
    formGroup: {
        marginBottom: '20px',
        flex: 1,
    },
    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '8px',
    },
    input: {
        width: '100%',
        padding: '10px 16px',
        fontSize: '14px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        outline: 'none',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: 'black',
    },
    textarea: {
        width: '100%',
        padding: '10px 16px',
        fontSize: '14px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        outline: 'none',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        resize: 'vertical',
        minHeight: '60px',
        color: 'black',
    },
    modalFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 24px 24px 24px',
        borderTop: '1px solid #e5e7eb',
    },
    footerRight: {
        display: 'flex',
        gap: '12px',
    },
    historyButton: {
        backgroundColor: '#ffffff',
        color: '#2563eb',
        border: '1px solid #2563eb',
        borderRadius: '8px',
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    cancelButton: {
        backgroundColor: '#ffffff',
        color: '#374151',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    saveButton: {
        backgroundColor: '#2563eb',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    errorText: {
        display: 'block',
        color: '#dc2626',
        fontSize: '12px',
        marginTop: '4px',
    },
};