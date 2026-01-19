import { useState, useEffect } from 'react';

export default function SavedServiceEditModal({ isOpen, onClose, onSave, services, editService }) {
    const [newService, setNewService] = useState({
        code: '',
        name: '',
        price: '',
        duration: '',
        description: '',
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = (field, value) => {
        let formattedValue = value;
        let newErrors = { ...errors };

        // Only allow numbers and decimals for price
        if (field === 'price') {
            formattedValue = value.replace(/[^0-9.]/g, '');
            // Ensure only one decimal point
            const parts = formattedValue.split('.');
            if (parts.length > 2) {
                formattedValue = parts[0] + '.' + parts.slice(1).join('');
            }
        }

        // Only allow whole numbers for duration
        if (field === 'duration') {
            formattedValue = value.replace(/[^0-9]/g, '');
        }

        setNewService({ ...newService, [field]: formattedValue });
        setErrors(newErrors);
    };

    useEffect(() => {
        if (editService) {
            setNewService({
                code: editService.ServiceCode || '',
                name: editService.ServiceName || '',
                price: editService.ServicePrice || '',
                duration: editService.ServiceDuration || '',
                description: editService.ServiceDescription || '',
            });
        }
    }, [editService]);

    const handleSubmit = () => {
        let newErrors = {};

        if (!newService.code.trim()) {
            newErrors.code = 'Service code is required';
        }
        for (let i in services) {
            if (services[i].ServiceCode.toLowerCase() === newService.code.toLowerCase() && newService.code.toLowerCase() != editService.ServiceCode.toLowerCase()) {
                newErrors.code = 'Service code is already used';
                break;
            }
        }

        if (!newService.name.trim()) {
            newErrors.name = 'Service name is required';
        }

        if (!newService.price || parseFloat(newService.price) <= 0) {
            newErrors.price = 'Please enter a valid price';
        }

        if (!newService.duration || parseInt(newService.duration) <= 0) {
            newErrors.duration = 'Please enter a valid duration';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        onSave(newService);
        setErrors({});
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={styles.modalOverlay} onClick={handleClose}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h3 style={styles.modalTitle}>Add New Service</h3>
                    <button style={styles.closeButton} onClick={handleClose}>×</button>
                </div>

                <div style={styles.modalBody}>
                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Service Code</label>
                            <input
                                type="text"
                                value={newService.code}
                                onChange={(e) => handleInputChange('code', e.target.value)}
                                style={{
                                    ...styles.input,
                                    borderColor: errors.code ? '#dc2626' : '#e5e7eb',
                                }}
                                placeholder="e.g., SRV001"
                            />
                            {errors.code && (
                                <span style={styles.errorText}>{errors.code}</span>
                            )}
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Service Name</label>
                            <input
                                type="text"
                                value={newService.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                style={{
                                    ...styles.input,
                                    borderColor: errors.name ? '#dc2626' : '#e5e7eb',
                                }}
                                placeholder="e.g., Gel Manicure"
                            />
                            {errors.name && (
                                <span style={styles.errorText}>{errors.name}</span>
                            )}
                        </div>
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Price ($)</label>
                            <input
                                type="text"
                                value={newService.price}
                                onChange={(e) => handleInputChange('price', e.target.value)}
                                style={{
                                    ...styles.input,
                                    borderColor: errors.price ? '#dc2626' : '#e5e7eb',
                                }}
                                placeholder="0.00"
                            />
                            {errors.price && (
                                <span style={styles.errorText}>{errors.price}</span>
                            )}
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Duration (minutes)</label>
                            <input
                                type="text"
                                value={newService.duration}
                                onChange={(e) => handleInputChange('duration', e.target.value)}
                                style={{
                                    ...styles.input,
                                    borderColor: errors.duration ? '#dc2626' : '#e5e7eb',
                                }}
                                placeholder="30"
                            />
                            {errors.duration && (
                                <span style={styles.errorText}>{errors.duration}</span>
                            )}
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Description (Optional)</label>
                        <textarea
                            value={newService.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            style={styles.textarea}
                            placeholder="Brief description of the service"
                            rows="3"
                        />
                    </div>
                </div>

                <div style={styles.modalFooter}>
                    <button style={styles.cancelButton} onClick={handleClose}>
                        Cancel
                    </button>
                    <button style={styles.saveButton} onClick={handleSubmit}>
                        Add Service
                    </button>
                </div>
            </div>
        </div>
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
        justifyContent: 'flex-end',
        gap: '12px',
        padding: '16px 24px 24px 24px',
        borderTop: '1px solid #e5e7eb',
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