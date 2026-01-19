import { useState, useEffect } from 'react';

export default function TechScheduleModal({ isOpen, onClose, techID }) {
    const [schedules, setSchedules] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const apiURL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (!techID || !isOpen) return;
        fetch(apiURL + '/technicians/' + techID + '/schedules/', {
            method: 'GET',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }),
            credentials: 'include',
        })
            .then(response => response.json())
            .then(data => {
                setSchedules(data)
            })
            .catch(error => {
                console.error('Error fetching schedules:', error);
            });
    }, [techID, apiURL, isOpen]);

    if (!isOpen) return null;

    // Get the effective availability for a specific date
    const getAvailabilityForDate = (date) => {
        // Create date at local midnight for accurate comparison
        const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        // Filter schedules that include this date
        const applicableSchedules = schedules.filter(schedule => {
            // Parse backend dates as local dates (not UTC)
            const fromParts = schedule.From.split('-');
            const toParts = schedule.To.split('-');
            const from = new Date(fromParts[0], fromParts[1] - 1, fromParts[2]);
            const to = new Date(toParts[0], toParts[1] - 1, toParts[2]);


            return localDate >= from && localDate <= to;
        });

        if (applicableSchedules.length === 0) {
            return null; // No schedule defined
        }

        // Sort by Created_At (newest first) to get the most recent override
        applicableSchedules.sort((a, b) =>
            new Date(b.Created_At) - new Date(a.Created_At)
        );

        // Return the most recent schedule's availability
        return applicableSchedules[0].Availability;
    };

    // Generate calendar days for the selected month
    const generateCalendarDays = () => {
        const year = selectedMonth.getFullYear();
        const month = selectedMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        let currentDate = new Date(startDate);

        while (currentDate <= lastDay || days.length % 7 !== 0) {
            days.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return days;
    };

    const changeMonth = (offset) => {
        const newDate = new Date(selectedMonth);
        newDate.setMonth(newDate.getMonth() + offset);
        setSelectedMonth(newDate);
    };

    const calendarDays = generateCalendarDays();
    const monthYear = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h3 style={styles.modalTitle}>Technician Schedule</h3>
                    <button style={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div style={styles.modalBody}>
                    <div style={styles.container}>
                        <div style={styles.header}>
                            <button style={styles.navButton} onClick={() => changeMonth(-1)}>
                                ← Prev
                            </button>
                            <h2 style={styles.monthTitle}>{monthYear}</h2>
                            <button style={styles.navButton} onClick={() => changeMonth(1)}>
                                Next →
                            </button>
                        </div>

                        <div style={styles.calendar}>
                            <div style={styles.weekdayHeader}>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} style={styles.weekdayCell}>{day}</div>
                                ))}
                            </div>

                            <div style={styles.daysGrid}>
                                {calendarDays.map((date, index) => {
                                    const isCurrentMonth = date.getMonth() === selectedMonth.getMonth();
                                    const availability = getAvailabilityForDate(date);
                                    const isToday = date.toDateString() === new Date().toDateString();

                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                ...styles.dayCell,
                                                opacity: isCurrentMonth ? 1 : 0.3,
                                                backgroundColor:
                                                    availability === true ? '#d1fae5' :
                                                        availability === false ? '#fee2e2' :
                                                            '#ffffff',
                                                border: isToday ? '2px solid #2563eb' : '1px solid #e5e7eb',
                                            }}
                                        >
                                            <span style={styles.dayNumber}>{date.getDate()}</span>
                                            {availability !== null && (
                                                <span style={{
                                                    ...styles.statusBadge,
                                                    backgroundColor: availability ? '#10b981' : '#ef4444',
                                                }}>
                                                    {availability ? 'Available' : 'Unavailable'}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={styles.legend}>
                            <div style={styles.legendItem}>
                                <div style={{ ...styles.legendBox, backgroundColor: '#d1fae5' }}></div>
                                <span style={styles.legendText}>Available</span>
                            </div>
                            <div style={styles.legendItem}>
                                <div style={{ ...styles.legendBox, backgroundColor: '#fee2e2' }}></div>
                                <span style={styles.legendText}>Unavailable</span>
                            </div>
                            <div style={styles.legendItem}>
                                <div style={{ ...styles.legendBox, backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}></div>
                                <span style={styles.legendText}>No Schedule</span>
                            </div>
                        </div>

                        {/* <div style={styles.scheduleList}>
                            <h3 style={styles.listTitle}>All Schedules</h3>
                            {schedules.length === 0 ? (
                                <p style={styles.emptyText}>No schedules defined</p>
                            ) : (
                                schedules
                                    .sort((a, b) => new Date(b.Created_At) - new Date(a.Created_At))
                                    .map(schedule => (
                                        <div key={schedule.ScheduleID} style={styles.scheduleCard}>
                                            <div style={styles.scheduleHeader}>
                                                <span style={{
                                                    ...styles.availabilityBadge,
                                                    backgroundColor: schedule.Availability ? '#d1fae5' : '#fee2e2',
                                                    color: schedule.Availability ? '#065f46' : '#991b1b',
                                                }}>
                                                    {schedule.Availability ? 'Available' : 'Unavailable'}
                                                </span>
                                                <span style={styles.dateRange}>
                                                    {schedule.From} - {schedule.To}
                                                </span>
                                            </div>
                                            <span style={styles.createdAt}>
                                                Created: {new Date(schedule.Created_At).toLocaleString()}
                                            </span>
                                        </div>
                                    ))
                            )}
                        </div> */}
                    </div>
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
        zIndex: 1002,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '900px',
        maxHeight: '90vh',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
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
        overflowY: 'auto',
        flex: 1,
    },
    container: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    monthTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#111827',
        margin: 0,
    },
    navButton: {
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
    calendar: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        marginBottom: '20px',
    },
    weekdayHeader: {
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
    },
    weekdayCell: {
        padding: '12px',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    daysGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
    },
    dayCell: {
        minHeight: '80px',
        padding: '8px',
        border: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '4px',
    },
    dayNumber: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
    },
    statusBadge: {
        fontSize: '10px',
        fontWeight: '500',
        color: '#ffffff',
        padding: '2px 6px',
        borderRadius: '4px',
    },
    legend: {
        display: 'flex',
        gap: '20px',
        marginBottom: '30px',
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    legendBox: {
        width: '20px',
        height: '20px',
        borderRadius: '4px',
    },
    legendText: {
        fontSize: '14px',
        color: '#374151',
    },
    scheduleList: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '20px',
    },
    listTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#111827',
        margin: '0 0 16px 0',
    },
    emptyText: {
        color: '#6b7280',
        fontSize: '14px',
    },
    scheduleCard: {
        padding: '12px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        marginBottom: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    scheduleHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    availabilityBadge: {
        fontSize: '12px',
        fontWeight: '600',
        padding: '4px 10px',
        borderRadius: '12px',
    },
    dateRange: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
    },
    createdAt: {
        fontSize: '12px',
        color: '#6b7280',
        fontStyle: 'italic',
    },
};