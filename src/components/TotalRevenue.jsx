import { useState, useEffect } from 'react';

export default function TotalRevenue({ data }) {
    const [revenueData, setRevenueData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [revenueTrend, setRevenueTrend] = useState('');
    const [trendColor, setTrendColor] = useState('#666');

    useEffect(() => {
        processData();
    }, [data]);

    const processData = () => {
        if (data) {
            if (data.EarnedTotals) {
                setRevenueData(data);
                setLoading(false);
            }
            if (data.EarnedTotalsTrend != 0) {
                if (data.EarnedTotalsTrend > 0) {
                    setRevenueTrend(`↑ ${data.EarnedTotalsTrend.toFixed(2)}%`);
                    setTrendColor('#10b981');
                }
                else if (data.EarnedTotalsTrend < 0) {
                    setRevenueTrend(`↓ ${Math.abs(data.EarnedTotalsTrend).toFixed(2)}%`);
                    setTrendColor('#ef4444');
                }
            }
            else {
                setRevenueTrend('N/A');
                setTrendColor('#666');
            }
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

    function calculatePercentageChange(current, previous) {
        const change = ((current - previous) / previous) * 100;
        const isPositive = change >= 0;
        return {
            trend: `${isPositive ? '↑' : '↓'} ${Math.abs(change).toFixed(2)}%`,
            color: isPositive ? '#10b981' : '#ef4444'
        };
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
    ];

    if (revenueData.From == revenueData.To) {
        stats.push({
            label: 'Top performing technician',
            value: revenueData.TechTotals[0]?.TechName || 'N/A'
        },
            {
                label: 'Average per Technician',
                value: formatCurrency(revenueData.TechTotals.reduce((sum, tech) => sum + tech.Total, 0) / revenueData.TechTotals.length || 0)
            }
        )
    }
    else {
        stats.push({
            label: 'Average revenue per Day',
            value: formatCurrency(revenueData.DailyRevenueAverage.Avg)
        },
            {
                label: 'Highest Day',
                value: formatCurrency(revenueData.DailyRevenueAverage.Max)
            })
    }



    return (
        <div style={styles.totalRevenue}>
            <div style={styles.header}>
                <h3 style={styles.title}>Total Revenue</h3>
                <span style={{
                    ...styles.trend,
                    color: trendColor
                }}>
                    {revenueTrend}
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