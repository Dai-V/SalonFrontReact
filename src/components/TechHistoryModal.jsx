import { useState, useEffect } from 'react';

export default function TechHistoryModal({ isOpen, onClose, techID }) {
    const [activeTab, setActiveTab] = useState('previous');
    const [appointments, setAppointments] = useState([]);
    const [prevAppointments, setPrevAppointments] = useState([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [expandedAppointments, setExpandedAppointments] = useState(new Set());
    const apiURL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (!techID) return;

        fetch(apiURL + '/technicians/service_history/' + techID + '/', {
            method: 'GET',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }),
            credentials: 'include',
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                setAppointments(data)
                const now = new Date();
                setPrevAppointments(data.filter(appointment =>
                    new Date(appointment.AppDate) < now
                ));
                setUpcomingAppointments(data.filter(appointment =>
                    new Date(appointment.AppDate) >= now
                ));
            })
            .catch(error => {
                console.error('Error fetching appointments:', error);
            });
    }, [techID, apiURL]);

    const toggleAppointment = (appointmentID) => {
        const newExpanded = new Set(expandedAppointments);
        if (newExpanded.has(appointmentID)) {
            newExpanded.delete(appointmentID);
        } else {
            newExpanded.add(appointmentID);
        }
        setExpandedAppointments(newExpanded);
    };

    if (!isOpen) return null;

    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h3 style={styles.modalTitle}>Technician History</h3>
                    <button style={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div style={styles.tabContainer}>
                    <button
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'previous' ? styles.activeTab : {}),
                        }}
                        onClick={() => setActiveTab('previous')}
                    >
                        Previous Appointments
                    </button>
                    <button
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'upcoming' ? styles.activeTab : {}),
                        }}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        Upcoming Appointments
                    </button>
                </div>

                <div style={styles.historyBody}>
                    {activeTab === 'previous' ? (
                        <div>
                            {prevAppointments.length === 0 ? (
                                <p style={styles.historyPlaceholder}>No previous appointments found.</p>
                            ) : (
                                <div style={styles.appointmentList}>
                                    {prevAppointments.map((appointment) => {
                                        const isExpanded = expandedAppointments.has(appointment.AppID);
                                        return (
                                            <div key={appointment.AppID} style={styles.appointmentCard}>
                                                <div
                                                    style={styles.appointmentHeader}
                                                    onClick={() => toggleAppointment(appointment.AppID)}
                                                >
                                                    <div style={styles.appointmentMainInfo}>
                                                        <span style={styles.appointmentDate}>
                                                            {new Date(appointment.AppDate).toLocaleDateString('en-US', {
                                                                weekday: 'short',
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                            &nbsp;-&nbsp;{appointment.CustomerID.CustomerFirstName} {appointment.CustomerID.CustomerLastName}
                                                        </span>
                                                        <span style={styles.appointmentStatus}>
                                                            {appointment.AppStatus}
                                                        </span>

                                                    </div>
                                                    <div style={styles.appointmentRightInfo}>
                                                        <span style={styles.appointmentTotal}>
                                                            ${parseFloat(appointment.AppTotal).toFixed(2)}
                                                        </span>
                                                        <span style={styles.expandIcon}>
                                                            {isExpanded ? '▼' : '▶'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {isExpanded && appointment.Services && appointment.Services.length > 0 && (
                                                    <div style={styles.servicesContainer}>
                                                        <h4 style={styles.servicesTitle}>Services</h4>
                                                        {appointment.Services.map((service) => (
                                                            <div key={service.ServiceID} style={styles.serviceRow}>
                                                                <div style={styles.serviceInfo}>
                                                                    <span style={styles.serviceTime}>
                                                                        {service.ServiceStartTime}
                                                                    </span>
                                                                    {service.CustomerID && service.CustomerID.CustomerFirstName && (
                                                                        <p style={styles.customerName}>
                                                                            👤 {service.CustomerID.CustomerFirstName} {service.CustomerID.CustomerLastName}
                                                                        </p>
                                                                    )}
                                                                    <span style={styles.serviceCode}>
                                                                        {service.ServiceCode}
                                                                    </span>
                                                                    <div style={styles.serviceDetails}>
                                                                        <p style={styles.serviceName}>
                                                                            {service.ServiceName}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <span style={styles.servicePrice}>
                                                                    ${parseFloat(service.ServicePrice).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            {upcomingAppointments.length === 0 ? (
                                <p style={styles.historyPlaceholder}>No upcoming appointments scheduled.</p>
                            ) : (
                                <div style={styles.appointmentList}>
                                    {upcomingAppointments.map((appointment) => {
                                        const isExpanded = expandedAppointments.has(appointment.AppID);
                                        return (
                                            <div key={appointment.AppID} style={styles.appointmentCard}>
                                                <div
                                                    style={styles.appointmentHeader}
                                                    onClick={() => toggleAppointment(appointment.AppID)}
                                                >
                                                    <div style={styles.appointmentMainInfo}>
                                                        <span style={styles.appointmentDate}>
                                                            {new Date(appointment.AppDate).toLocaleDateString('en-US', {
                                                                weekday: 'short',
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                        <span style={styles.appointmentStatus}>
                                                            {appointment.AppStatus}
                                                        </span>
                                                    </div>
                                                    <div style={styles.appointmentRightInfo}>
                                                        <span style={styles.appointmentTotal}>
                                                            ${parseFloat(appointment.AppTotal).toFixed(2)}
                                                        </span>
                                                        <span style={styles.expandIcon}>
                                                            {isExpanded ? '▼' : '▶'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {isExpanded && appointment.Services && appointment.Services.length > 0 && (
                                                    <div style={styles.servicesContainer}>
                                                        <h4 style={styles.servicesTitle}>Services</h4>
                                                        {appointment.Services.map((service) => (
                                                            <div key={service.ServiceID} style={styles.serviceRow}>
                                                                <div style={styles.serviceInfo}>
                                                                    <span style={styles.serviceTime}>
                                                                        {service.ServiceStartTime}
                                                                    </span>
                                                                    {service.CustomerID && service.CustomerID.CustomerFirstName && (
                                                                        <p style={styles.customerName}>
                                                                            👤 {service.CustomerID.CustomerFirstName} {service.CustomerID.CustomerLastName}
                                                                        </p>
                                                                    )}
                                                                    <span style={styles.serviceCode}>
                                                                        {service.ServiceCode}
                                                                    </span>
                                                                    <div style={styles.serviceDetails}>
                                                                        <p style={styles.serviceName}>
                                                                            {service.ServiceName}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <span style={styles.servicePrice}>
                                                                    ${parseFloat(service.ServicePrice).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div style={styles.modalFooter}>
                    <button style={styles.closeButton2} onClick={onClose}>
                        Close
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
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '700px',
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
    tabContainer: {
        display: 'flex',
        backgroundColor: '#f9fafb',
    },
    tab: {
        flex: 1,
        padding: '14px 20px',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: '2px solid transparent',
        fontSize: '14px',
        fontWeight: '500',
        color: '#6b7280',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        outline: 'none',
    },
    activeTab: {
        color: '#2563eb',
        borderBottom: '2px solid #2563eb',
        backgroundColor: '#ffffff',
    },
    historyBody: {
        padding: '24px',
        minHeight: '200px',
        maxHeight: '60vh',
        overflowY: 'auto',
    },
    historyPlaceholder: {
        color: '#6b7280',
        fontSize: '14px',
        marginBottom: '12px',
    },
    appointmentList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    appointmentCard: {
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
    },
    appointmentHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        backgroundColor: '#f9fafb',
    },
    appointmentMainInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    appointmentDate: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#111827',
    },
    appointmentStatus: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#6b7280',
        backgroundColor: '#e5e7eb',
        padding: '4px 10px',
        borderRadius: '12px',
    },
    appointmentRightInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    appointmentTotal: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#2563eb',
    },
    expandIcon: {
        fontSize: '12px',
        color: '#6b7280',
    },
    servicesContainer: {
        padding: '16px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e5e7eb',
    },
    servicesTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
        margin: '0 0 12px 0',
    },
    serviceRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid #f3f4f6',
    },
    serviceInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flex: 1,
    },
    serviceTime: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#2563eb',
        minWidth: '60px',
    },
    serviceCode: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#6b7280',
        backgroundColor: '#f3f4f6',
        padding: '2px 8px',
        borderRadius: '4px',
    },
    serviceDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    serviceName: {
        fontSize: '14px',
        color: '#374151',
        fontWeight: '500',
        margin: 0,
    },
    customerName: {
        fontSize: '12px',
        color: '#6b7280',
        fontStyle: 'italic',
        margin: 0,
    },
    servicePrice: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#111827',
    },
    modalFooter: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        padding: '16px 24px 24px 24px',
        borderTop: '1px solid #e5e7eb',
    },
    closeButton2: {
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
};