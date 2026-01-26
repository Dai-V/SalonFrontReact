import { useState, useEffect } from 'react';
import React from 'react';

export default function Appointments({ selectedDate = new Date() }) {
    const [technicians, setTechnicians] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const apiURL = import.meta.env.VITE_API_URL;
    const tableContainerRef = React.useRef(null);

    // Generate time slots from 6:00 AM to 6:00 PM in 15-minute intervals
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 6; hour < 18; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const displayTime = `${(hour > 12 ? hour - 12 : hour)}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
                slots.push({ time, displayTime });
            }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    // Fetch technicians for selected date
    useEffect(() => {
        fetchTechnicians();
    }, []);

    // Scroll to current time slot on mount
    useEffect(() => {
        if (!loading && tableContainerRef.current) {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            // Round down to nearest 15-minute interval
            const roundedMinute = Math.floor(currentMinute / 15) * 15;
            const currentTime = `${currentHour.toString().padStart(2, '0')}:${roundedMinute.toString().padStart(2, '0')}`;

            // Find the index of the current time slot
            const currentSlotIndex = timeSlots.findIndex(slot => slot.time === currentTime);

            if (currentSlotIndex !== -1) {
                const rowHeight = 21;
                const scrollPosition = (currentSlotIndex * rowHeight);
                tableContainerRef.current.scrollTop = scrollPosition;
            }
        }
    }, [loading]);

    const getCurrentTimePosition = () => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        if (currentHour < 6 || currentHour >= 18) return null;

        const minutesSince6AM = (currentHour - 6) * 60 + currentMinute;
        const rowHeight = 21;
        const headerHeight = 45;
        const position = (minutesSince6AM / 15) * rowHeight + headerHeight;

        return position;
    };

    const fetchTechnicians = async () => {
        setLoading(true);
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const response = await fetch(`${apiURL}/technicians/?Date=${dateStr}`, {
                method: 'GET',
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }),
                credentials: 'include',
            });
            const data = await response.json();
            setTechnicians(data);

            const apptResponse = await fetch(`${apiURL}/appointments/?Date=2026-01-24`, {
                method: 'GET',
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }),
                credentials: 'include',
            });
            const apptData = await apptResponse.json();
            setAppointments(apptData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setLoading(false);
    };

    const getServiceForSlot = (techId, timeSlot) => {
        for (const apt of appointments) {
            if (apt.Services) {
                const service = apt.Services.find(s => {
                    const serviceTime = s.ServiceStartTime.substring(0, 5);
                    return s.TechID === techId && serviceTime === timeSlot;
                });
                if (service) {
                    return { appointment: apt, service };
                }
            }
        }
        return null;
    };

    const calculateSlotSpan = (service) => {
        return Math.ceil(service.ServiceDuration / 15);
    };

    // Build a map of which slots are start points for appointments
    const buildAppointmentMap = () => {
        const map = {};
        technicians.forEach(tech => {
            map[tech.TechID] = {};
            timeSlots.forEach((slot, index) => {
                const result = getServiceForSlot(tech.TechID, slot.time);
                if (result) {
                    const span = calculateSlotSpan(result.service);
                    map[tech.TechID][index] = { result, span };
                    // Mark covered slots
                    for (let i = 1; i < span; i++) {
                        map[tech.TechID][index + i] = { covered: true };
                    }
                }
            });
        });
        return map;
    };

    const appointmentMap = buildAppointmentMap();

    return (
        <div style={styles.container}>
            <div style={styles.tableContainer} ref={tableContainerRef}>
                {loading ? (
                    <div style={styles.loadingContainer}>
                        <div style={styles.loadingText}>Loading...</div>
                    </div>
                ) : (
                    <>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeaderRow}>
                                    <th style={styles.tableHeaderTime}>Time</th>
                                    {technicians.map(tech => (
                                        <th key={tech.TechID} style={{
                                            ...styles.tableHeader,
                                            width: `calc((100% - 100px) / ${technicians.length})`
                                        }}>
                                            {tech.TechName}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {timeSlots.map((slot, index) => {
                                    const isHourMark = slot.time.endsWith(':00');
                                    const isHalfHour = slot.time.endsWith(':30');
                                    const hour = parseInt(slot.time.split(':')[0]);
                                    const isEvenHour = hour % 2 === 0;

                                    return (
                                        <tr key={slot.time} style={styles.tableRow}>
                                            <td style={{
                                                ...styles.timeCell,
                                                backgroundColor: (isHourMark || isHalfHour) ? '#f3f4f6' : '#f9fafb',
                                            }}>
                                                {slot.time.endsWith(':00') || slot.time.endsWith(':30') ? slot.displayTime : '\u00A0'}
                                            </td>

                                            {technicians.map(tech => {
                                                const cellInfo = appointmentMap[tech.TechID][index];

                                                // Skip if this cell is covered by a previous rowspan
                                                if (cellInfo?.covered) {
                                                    return null;
                                                }

                                                // Render appointment cell
                                                if (cellInfo?.result) {
                                                    const { appointment, service } = cellInfo.result;
                                                    const customerName = appointment.Customer
                                                        ? `${appointment.Customer.CustomerFirstName || ''} ${appointment.Customer.CustomerLastName || ''}`.trim()
                                                        : 'Unknown Customer';

                                                    return (
                                                        <td
                                                            key={tech.TechID}
                                                            rowSpan={cellInfo.span}
                                                            style={styles.appointmentCell}
                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#93c5fd'}
                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dbeafe'}
                                                        >
                                                            <div style={styles.appointmentClient}>{customerName}</div>
                                                            <div style={styles.appointmentService}>{service.ServiceName}</div>
                                                            <div style={styles.appointmentDuration}>{service.ServiceDuration} min</div>
                                                        </td>
                                                    );
                                                }

                                                // Render empty cell
                                                return (
                                                    <td
                                                        key={tech.TechID}
                                                        style={{
                                                            ...styles.tableCell,
                                                            backgroundColor: (isHourMark || isHalfHour) ? '#f9fafb' : 'transparent',
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0f2fe'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = (isHourMark || isHalfHour) ? '#f9fafb' : 'transparent'}
                                                    >
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {getCurrentTimePosition() !== null && (
                            <div style={{
                                position: 'absolute',
                                top: `${getCurrentTimePosition()}px`,
                                left: 0,
                                right: 0,
                                height: '2px',
                                backgroundColor: '#ef4444',
                                zIndex: 15,
                                pointerEvents: 'none',
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '0',
                                    top: '-4px',
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: '#ef4444',
                                    borderRadius: '50%',
                                }}></div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '0',
    },
    tableContainer: {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        maxHeight: '70vh',
        overflowY: 'auto',
        overflowX: 'auto',
        position: 'relative',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
    },
    tableHeaderRow: {
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
    },
    tableHeader: {
        padding: '12px 16px',
        textAlign: 'center',
        fontSize: '12px',
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
        position: 'sticky',
        top: 0,
        backgroundColor: '#f9fafb',
        zIndex: 10,
    },
    tableHeaderTime: {
        padding: '12px 16px',
        textAlign: 'center',
        fontSize: '12px',
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
        position: 'sticky',
        top: 0,
        left: 0,
        backgroundColor: '#f9fafb',
        zIndex: 20,
        width: '100px',
        minWidth: '100px',
    },
    tableRow: {
        borderBottom: '1px solid #e5e7eb',
        transition: 'background-color 0.2s',
    },
    timeCell: {
        padding: '2px 16px',
        fontSize: '13px',
        fontWeight: '500',
        color: '#374151',
        backgroundColor: '#f9fafb',
        whiteSpace: 'nowrap',
        borderRight: '1px solid #e5e7eb',
        position: 'sticky',
        left: 0,
        zIndex: 5,
        width: '100px',
        minWidth: '100px',
        maxWidth: '100px',
    },
    tableCell: {
        padding: '2px 16px',
        fontSize: '14px',
        color: '#374151',
        borderRight: '1px solid #e5e7eb',
        verticalAlign: 'top',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    appointmentCell: {
        padding: '2px 16px',
        fontSize: '14px',
        color: '#374151',
        backgroundColor: '#dbeafe',
        border: '2px solid #3b82f6',
        verticalAlign: 'top',
    },
    appointmentClient: {
        fontWeight: '500',
        color: '#111827',
        marginBottom: '4px',
    },
    appointmentService: {
        fontSize: '12px',
        color: '#1f2937',
        marginBottom: '2px',
    },
    appointmentDuration: {
        fontSize: '12px',
        color: '#6b7280',
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
    },
    loadingText: {
        fontSize: '14px',
        color: '#6b7280',
    },
};