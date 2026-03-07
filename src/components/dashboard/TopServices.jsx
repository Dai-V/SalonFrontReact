import { useState, useEffect } from 'react';



export default function TopServices({ data }) {
    const [topServices, setTopServices] = useState([]);
    const [serviceCount, setServiceCount] = useState(0);
    const [serviceCountTrend, setServiceCountTrend] = useState('');
    const [trendColor, setTrendColor] = useState('#666');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        processData();
    }, [data]);

    const processData = () => {
        if (data) {
            if (data.TopServices) {
                setTopServices(data.TopServices)
                setServiceCount(data.ServiceCount)
                setLoading(false);
            }

            if (data.ServiceCountTrend != 0) {
                if (data.ServiceCountTrend > 0) {
                    setServiceCountTrend(`↑ ${data.ServiceCountTrend.toFixed(2)}%`);
                    setTrendColor('#10b981');
                }
                else if (data.ServiceCountTrend < 0) {
                    setServiceCountTrend(`↓ ${Math.abs(data.ServiceCountTrend).toFixed(2)}%`);
                    setTrendColor('#ef4444');
                }
            }
            else {
                setServiceCountTrend('N/A');
                setTrendColor('#666');
            }

        }
    };

    if (loading) {
        return <div style={styles.loading}>Loading...</div>;
    }

    return (
        <div style={styles.topServices}>
            <div style={styles.header}>
                <h3 style={styles.title}>Total Services</h3>
                <span style={{
                    ...styles.trend,
                    color: trendColor
                }}>
                    {serviceCountTrend}
                </span>
            </div>
            <div style={styles.mainValue}>{serviceCount}</div>
            <div style={styles.subtitle}>
                Most popular services
            </div>

            <div style={styles.servicesList}>
                {topServices.map((service, index) => (
                    <div key={service.ServiceName || index} style={styles.serviceItem}>
                        <div style={styles.serviceInfo}>
                            <span style={styles.serviceRank}>#{index + 1}</span>
                            <span style={styles.serviceName}>
                                {service.ServiceName || 'Unknown Service'}
                            </span>
                        </div>
                        <div style={styles.serviceCount}>{service.Count}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    topServices: {
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        height: '400px',  // Add this
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
    trend: {
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: '500'
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
    servicesList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginTop: '16px'
    },
    serviceItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1px solid #e5e7eb'
    },
    serviceInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    serviceRank: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#9ca3af'
    },
    serviceName: {
        fontWeight: '400',
        color: '#374151',
        fontSize: '14px'
    },
    serviceCount: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1f2937'
    },
    loading: {
        padding: '16px',
        color: '#666'
    }
};