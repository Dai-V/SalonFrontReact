import { useState, useEffect } from 'react';
import TotalsByDayOfWeekChart from './TotalsByDayOfWeekChart';
import TopServices from './TopServices';
import AppointmentsByStatus from './AppointmentsByStatus';
import TotalRevenue from './TotalRevenue';
import { formatLocalDate } from '../utils/dateUtils';

const styles = {
    container: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '0',
    },
    buttonRow: {
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
    },
    button: {
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: '500',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#e5e7eb',
        borderRadius: '8px',
        backgroundColor: 'white',
        color: '#374151',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    buttonActive: {
        backgroundColor: '#2563eb',
        color: 'white',
        borderColor: '#2563eb',
    },
    cardRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginBottom: '20px',
        alignItems: 'start'
    },
    chartRow: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '20px',
        marginBottom: '20px',
    },
};

export default function Dashboard() {
    const apiURL = import.meta.env.VITE_API_URL;
    const [dashboardData, setDashboardData] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activeFilter, setActiveFilter] = useState('today');

    useEffect(() => {
        // Set today as default on mount
        handleFilterChange('today');
    }, []);

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        const today = new Date();
        let start, end;

        switch (filter) {
            case 'today':
                start = new Date(today);
                end = new Date(today);
                break;

            case 'week': {
                const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)

                // Convert Sunday (0) to 6, otherwise subtract 1
                const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

                start = new Date(today);
                start.setDate(today.getDate() + mondayOffset);

                end = new Date(start);
                end.setDate(start.getDate() + 6); // Sunday

                break;
            }

            case 'month':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

                break;

            case 'year':
                start = new Date(today.getFullYear(), 0, 1);
                end = new Date(today.getFullYear(), 11, 31);

                break;

            default:
                start = new Date(today);
                end = new Date(today);
        }


        const formattedStart = formatLocalDate(start);
        const formattedEnd = formatLocalDate(end);

        setStartDate(formattedStart);
        setEndDate(formattedEnd);
        fetchDashboard(formattedStart, formattedEnd);
    };

    const fetchDashboard = (start, end) => {
        fetch(apiURL + '/dashboard/?StartDate=' + start + '&EndDate=' + end, {
            method: 'GET',
            credentials: 'include',
        })
            .then(response => {
                return response.json()
            })
            .then(data => {
                console.log(data)
                setDashboardData(data);
            });
    };

    return (
        <div style={styles.container}>
            <div style={styles.buttonRow}>
                <button
                    style={{
                        ...styles.button,
                        ...(activeFilter === 'today' ? styles.buttonActive : {})
                    }}
                    onClick={() => handleFilterChange('today')}
                >
                    Today
                </button>
                <button
                    style={{
                        ...styles.button,
                        ...(activeFilter === 'week' ? styles.buttonActive : {})
                    }}
                    onClick={() => handleFilterChange('week')}
                >
                    This Week
                </button>
                <button
                    style={{
                        ...styles.button,
                        ...(activeFilter === 'month' ? styles.buttonActive : {})
                    }}
                    onClick={() => handleFilterChange('month')}
                >
                    This Month
                </button>
                <button
                    style={{
                        ...styles.button,
                        ...(activeFilter === 'year' ? styles.buttonActive : {})
                    }}
                    onClick={() => handleFilterChange('year')}
                >
                    This Year
                </button>
            </div>

            <div style={styles.cardRow}>
                <TopServices data={dashboardData} />
                <AppointmentsByStatus data={dashboardData} />
                <TotalRevenue data={dashboardData} />
            </div>
            {startDate !== endDate && (
                <div style={styles.chartRow}>
                    <TotalsByDayOfWeekChart data={dashboardData} />
                </div>
            )}

        </div>
    );
}