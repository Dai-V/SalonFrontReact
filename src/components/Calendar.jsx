import { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function Calendar({ selectedDate, onDateChange }) {
    const [showCalendar, setShowCalendar] = useState(false);
    const calendarRef = useRef(null);
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                calendarRef.current &&
                !calendarRef.current.contains(event.target)
            ) {
                setShowCalendar(false);
            }
        }
        if (showCalendar) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCalendar]);

    function changeDateBy(days) {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        onDateChange(newDate);
    }

    return (
        <div ref={calendarRef} style={styles.container}>
            <div style={styles.header}>
                <div style={styles.dateRowWrapper}>
                    {showCalendar &&
                        <div style={styles.calendarSection}>
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => {
                                    onDateChange(date)
                                }}
                                dateFormat="MMMM d, yyyy"
                                inline
                                calendarClassName="custom-calendar"
                            />
                        </div>
                    }

                    <div style={styles.infoSection}>
                        <div style={styles.selectedDateDisplay}>
                            <div style={styles.dateRow}>
                                <button
                                    style={styles.arrow}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        changeDateBy(-1);
                                        setShowCalendar(false)
                                    }}
                                    aria-label="Previous day"
                                >
                                    ◀
                                </button>
                                <div style={styles.dateValue} onClick={() => setShowCalendar(!showCalendar)}>
                                    {selectedDate.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div> <button
                                    style={styles.arrow}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        changeDateBy(1);
                                        setShowCalendar(false)
                                    }}
                                    aria-label="Next day"
                                >
                                    ▶
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        marginTop: '-10px',
        marginLeft: '-10px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        marginBottom: '30px',
    },
    dateRowWrapper: {
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        position: 'relative',
        display: 'inline-block',
    },

    calendarSection: {
        position: 'absolute',
        top: '100%',          // 👈 directly below dateValue
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: '8px',
        zIndex: 1000,
        backgroundColor: '#ffffff',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        borderRadius: '8px',
    },
    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '12px',
    },
    infoSection: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    selectedDateDisplay: {
        borderRadius: '8px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '0 8px',
    },
    dateValue: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#111827',
        cursor: 'pointer',
    },
    dateRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        justifyContent: 'center',
    },

    arrow: {
        background: 'none',
        border: 'none',
        fontSize: '18px',
        cursor: 'pointer',
        color: '#374151',
        padding: '4px 8px',
        borderRadius: '6px',
    },

    arrowHover: {
        backgroundColor: '#e5e7eb',
    },

};