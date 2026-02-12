import { useState, useEffect } from 'react';


export default function AppointmentsByStatus({ data }) {
    const [statusData, setStatusData] = useState([]);
    const [loading, setLoading] = useState(true);

    const statusColors = {
        'Open': '#93c5fd',
        'Pending': '#a7f3d0',
        'Closed': '#d1d5db',
        'Cancelled': '#ef4444'
    };

    useEffect(() => {
        processData();
    }, [data]);

    const processData = () => {
        if (data && data.AppointmentCountByStatus) {
            setStatusData(data.AppointmentCountByStatus);
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={styles.loading}>Loading...</div>;
    }

    const totalAppointments = statusData.reduce((sum, status) => sum + status.Count, 0);

    return (
        <div style={styles.appointmentStatus}>
            <div style={styles.header}>
                <h3 style={styles.title}>Total Appointments</h3>
            </div>
            <div style={styles.mainValue}>{totalAppointments}</div>
            <div style={styles.subtitle}>
                Status breakdown
            </div>

            <div style={styles.statusList}>
                {statusData.map((status, index) => (
                    <div key={status.AppStatus || index} style={styles.statusItem}>
                        <div style={styles.statusInfo}>
                            <span
                                style={{
                                    ...styles.statusIndicator,
                                    background: statusColors[status.AppStatus] || '#9ca3af'
                                }}
                            />
                            <span style={styles.statusName}>
                                {status.AppStatus == 'Pending' ? ' Checked In' : status.AppStatus}
                            </span>
                        </div>
                        <div style={styles.statusCount}>{status.Count}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    appointmentStatus: {
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        height: '400px',
        display: 'flex',
        flexDirection: 'column'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
    },
    title: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#666',
        margin: 0
    },
    mainValue: {
        fontSize: '48px',
        fontWeight: '600',
        margin: '8px 0 16px 0',
        color: '#1f2937'
    },
    subtitle: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#1f2937',
        marginBottom: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
    },
    description: {
        fontSize: '13px',
        color: '#666',
        margin: 0
    },
    statusList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginTop: '16px'
    },
    statusItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1px solid #e5e7eb'
    },
    statusInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    statusIndicator: {
        width: '12px',
        height: '12px',
        borderRadius: '50%'
    },
    statusName: {
        fontWeight: '400',
        color: '#374151',
        fontSize: '14px'
    },
    statusCount: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1f2937'
    },
    loading: {
        padding: '16px',
        color: '#666'
    }
};