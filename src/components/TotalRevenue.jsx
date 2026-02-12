import { useState, useEffect } from 'react';

export default function TotalRevenue({ data }) {
    const [revenueData, setRevenueData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        processData();
    }, [data]);

    const processData = () => {
        if (data && data.EarnedTotals) {
            setRevenueData(data);
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    if (loading) {
        return <div style={styles.loading}>Loading...</div>;
    }

    const stats = [
        {
            label: 'Avg per Appointment',
            value: formatCurrency(revenueData.AppointmentAverage.Avg)
        },
        {
            label: 'Highest Appointment',
            value: formatCurrency(revenueData.AppointmentAverage.Max)
        },
        {
            label: 'Avg Daily Revenue',
            value: formatCurrency(revenueData.DailyRevenueAverage.Avg)
        },
        {
            label: 'Highest Day',
            value: formatCurrency(revenueData.DailyRevenueAverage.Max)
        }
    ];

    return (
        <div style={styles.totalRevenue}>
            <div style={styles.header}>
                <h3 style={styles.title}>Total Revenue</h3>
                <span style={{
                    ...styles.trend,
                    color: '#10b981'
                }}>
                    ↗ Earned
                </span>
            </div>
            <div style={styles.mainValue}>{formatCurrency(revenueData.EarnedTotals)}</div>
            <div style={styles.subtitle}>
                Revenue breakdown
            </div>

            <div style={styles.statsList}>
                {stats.map((stat, index) => (
                    <div key={index} style={styles.statItem}>
                        <div style={styles.statLabel}>
                            {stat.label}
                        </div>
                        <div style={styles.statValue}>{stat.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    totalRevenue: {
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
    trend: {
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: '500'
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
    statsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginTop: '16px'
    },
    statItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1px solid #e5e7eb'
    },
    statLabel: {
        fontWeight: '400',
        color: '#374151',
        fontSize: '14px'
    },
    statValue: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1f2937'
    },
    loading: {
        padding: '16px',
        color: '#666'
    }
};