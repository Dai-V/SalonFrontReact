import { useState, useEffect } from 'react';

export default function TechScheduleModal({ isOpen, onClose, techID }) {
    const [schedules, setSchedules] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [showConfirmation, setShowConfirmation] = useState(null); // 'open' or 'close'
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showDateConfirmation, setShowDateConfirmation] = useState(false);
    const apiURL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (!techID || !isOpen) return;
        getSchedules();
    }, [techID, apiURL, isOpen]);

    const getSchedules = () => {
        fetch(apiURL + '/schedules/', {
            method: 'GET',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }),
            credentials: 'include',
        })
            .then(response => response.json())
            .then(data => {
                setSchedules(data.filter(schedule => schedule.TechID === techID));
            })
            .catch(error => {
                console.error('Error fetching schedules:', error);
            });
    }


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


    const confirmOpenAll = () => {
        fetch(apiURL + '/technicians/' + techID + '/schedules/', {
            method: 'POST',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': sessionStorage.getItem('csrfToken')
            }),
            credentials: 'include',
            body: JSON.stringify({
                From: "2000-01-01",
                To: "2099-12-31",
                Availability: true,
                TechID: techID,
            }),
        })
            .then(response => {
                if (response.ok) {
                    getSchedules();
                }
            }).catch(error => {
                console.error('Error editing schedules:', error);
            })
        setShowConfirmation(null);
    };

    const confirmCloseAll = () => {
        fetch(apiURL + '/technicians/' + techID + '/schedules/', {
            method: 'POST',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': sessionStorage.getItem('csrfToken')
            }),
            credentials: 'include',
            body: JSON.stringify({
                From: "2000-01-01",
                To: "2099-12-31",
                Availability: false,
                TechID: techID
            }),
        })
            .then(response => {
                if (response.ok) {
                    getSchedules();
                }
            }).catch(error => {
                console.error('Error editing schedules:', error);
            })
        setShowConfirmation(null);
    };

    const handleEditSchedules = () => {
        setShowEditModal(true);
    };

    const handleDayClick = (date, currentAvailability) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}/${month}/${day}`;
        setSelectedDate({ dateStr, currentAvailability });
        setShowDateConfirmation(true);
    };

    const confirmDateToggle = () => {
        const dateStr = selectedDate.dateStr.replace(/\//g, '-')
        fetch(apiURL + '/technicians/' + techID + '/schedules/', {
            method: 'POST',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': sessionStorage.getItem('csrfToken')
            }),
            credentials: 'include',
            body: JSON.stringify({
                From: dateStr,
                To: dateStr,
                Availability: selectedDate.currentAvailability === null ? true : !selectedDate.currentAvailability,
                TechID: techID,
            }),
        })
            .then(response => {
                if (response.ok) {
                    getSchedules();
                }
            })
            .catch(error => {
                console.error('Error updating schedule:', error);
            });

        setShowDateConfirmation(false);
        setSelectedDate(null);
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
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => handleDayClick(date, availability)}
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

                        <div>
                            <div style={styles.actionButtons}>
                                <div>
                                    <button style={styles.openAllButton} onClick={() => setShowConfirmation('open')}>
                                        Open All Dates
                                    </button>
                                    <button style={styles.closeAllButton} onClick={() => setShowConfirmation('close')}>
                                        Close All Dates
                                    </button>
                                </div>
                                <button style={styles.editButton} onClick={handleEditSchedules}>
                                    Edit Schedules
                                </button>
                            </div>
                        </div>

                        {showConfirmation === 'close' && (
                            <div style={styles.confirmOverlay}>
                                <div style={styles.confirmContent}>
                                    <div style={styles.confirmTitle}>Confirm Close All Dates</div>
                                    <p style={styles.confirmText}>
                                        Are you sure you want to mark{" "}
                                        <strong>all dates</strong> as{" "}
                                        <span style={{ color: '#ef4444' }}>unavailable</span>?
                                    </p>
                                    <div style={styles.confirmButtons}>

                                        <button style={styles.confirmCancel} onClick={() => setShowConfirmation(null)}>Cancel</button>
                                        <button style={styles.confirmOpen} onClick={confirmCloseAll}>Confirm</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {showConfirmation === 'open' && (
                            <div style={styles.confirmOverlay}>
                                <div style={styles.confirmContent}>
                                    <div style={styles.confirmTitle}>Confirm Open All Dates</div>
                                    <p style={styles.confirmText}>
                                        Are you sure you want to mark{" "}
                                        <strong>all dates</strong> as{" "}
                                        <span style={{ color: '#10b981' }}>available</span>?
                                    </p>
                                    <div style={styles.confirmButtons}>

                                        <button style={styles.confirmCancel} onClick={() => setShowConfirmation(null)}>Cancel</button>
                                        <button style={styles.confirmOpen} onClick={confirmOpenAll}>Confirm</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {showDateConfirmation === true && (
                            <div style={styles.confirmOverlay}>
                                <div style={styles.confirmContent}>
                                    <div style={styles.confirmTitle}>Confirm</div>
                                    <p style={styles.confirmText}>
                                        Are you sure you want to mark{" "}
                                        <strong>{selectedDate.dateStr}</strong> as{" "}
                                        {!selectedDate.currentAvailability ? (
                                            <span style={{ color: '#10b981' }}>available</span>
                                        ) : (
                                            <span style={{ color: '#ef4444' }}>unavailable</span>
                                        )}
                                        ?
                                    </p>
                                    <div style={styles.confirmButtons}>

                                        <button style={styles.confirmCancel} onClick={() => setShowDateConfirmation(false)}>Cancel</button>
                                        <button style={styles.confirmOpen} onClick={confirmDateToggle}>Confirm</button>
                                    </div>
                                </div>
                            </div>
                        )}
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
    actionButtons: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'space-between',
        marginTop: '20px',
    },
    openAllButton: {
        backgroundColor: '#10b981',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    closeAllButton: {
        backgroundColor: '#ef4444',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        marginLeft: '10px',
    },
    editButton: {
        backgroundColor: '#2563eb',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
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
        color: '#111827',
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
        gap: '7px',
        justifyContent: 'flex-end',
    },
    confirmCancel: {
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
    confirmOpen: {
        backgroundColor: '#10b981',
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
    confirmClose: {
        backgroundColor: '#ef4444',
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
};