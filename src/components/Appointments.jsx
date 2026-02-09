import { useState, useEffect } from 'react';
import React from 'react';
import AppointmentAddModal from './AppointmentAddModal';
import AppointmentEditModal from './AppointmentEditModal';
import Calendar from './Calendar.jsx';

export default function Appointments() {
    const [technicians, setTechnicians] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [clickedTime, setClickedTime] = useState('');
    const [clickedTechID, setClickedTechID] = useState('');
    const [clickedAppointment, setClickedAppointment] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [hoveredAppointment, setHoveredAppointment] = useState(null);
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

    const formatDateForAPI = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const STATUS_CONFIG = {
        Open: {
            backgroundColor: '#dbeafe',
            hoverColor: '#93c5fd',
            borderColor: '#3b82f6'
        },
        Closed: {
            backgroundColor: '#e5e7eb',
            hoverColor: '#d1d5db',
            borderColor: '#6b7280'
        },
        Pending: {
            backgroundColor: '#d1fae5',
            hoverColor: '#a7f3d0',
            borderColor: '#10b981'
        }
    };

    const getAppointmentCellStyle = (status) => ({
        ...styles.appointmentCell,
        backgroundColor: STATUS_CONFIG[status]?.backgroundColor || '#dbeafe',
        boxShadow: `inset 2px 0 0 ${STATUS_CONFIG[status]?.borderColor || '#3b82f6'}`,
    });

    // Quick status change handler
    const handleQuickStatusChange = (appointment, newStatus) => {
        const appointmentData = {
            ...appointment,
            AppStatus: newStatus,
            CustomerID: appointment.CustomerID.CustomerID,
        };

        fetch(`${apiURL}/appointments/${appointment.AppID}/`, {
            method: 'PUT',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': sessionStorage.getItem('csrfToken')
            }),
            credentials: 'include',
            body: JSON.stringify(appointmentData)
        }).then(response => {
            if (response.ok) {
                fetchTechnicians();
                setHoveredAppointment(null);
            }
        });
    };

    // Fetch technicians for selected date
    useEffect(() => {
        fetchTechnicians();
    }, [selectedDate]);

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
    }, []);

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

    const handleAddAppointment = (appointmentData) => {
        fetch(`${apiURL}/appointments/`, {
            method: 'POST',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': sessionStorage.getItem('csrfToken')
            }),
            credentials: 'include',
            body: JSON.stringify(appointmentData)
        }).then(response => {
            if (response.ok) {
                fetchTechnicians();
            }
        });
    };

    const handleEditAppointment = (appointmentData) => {
        fetch(`${apiURL}/appointments/${clickedAppointment.AppID}/`, {
            method: 'PUT',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': sessionStorage.getItem('csrfToken')
            }),
            credentials: 'include',
            body: JSON.stringify(appointmentData)
        }).then(response => {
            if (response.ok) {
                fetchTechnicians();
            }
        });
    };


    const fetchTechnicians = async () => {
        setLoading(true);
        try {
            const dateStr = formatDateForAPI(selectedDate);
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

            const apptResponse = await fetch(`${apiURL}/appointments/?Date=${dateStr}`, {
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
            <Calendar
                selectedDate={selectedDate}
                onDateChange={(date) => {
                    setSelectedDate(date)
                }
                }
            />
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
                                                    const customerName = appointment.CustomerID
                                                        ? `${appointment.CustomerID.CustomerFirstName || ''} ${appointment.CustomerID.CustomerLastName || ''}`.trim()
                                                        : 'Unknown Customer';

                                                    const appointmentStatus = appointment.AppStatus || 'Open';
                                                    const isHovered = hoveredAppointment === appointment.AppID;

                                                    return (
                                                        <td
                                                            key={tech.TechID}
                                                            rowSpan={cellInfo.span}
                                                            style={{
                                                                ...getAppointmentCellStyle(appointmentStatus),
                                                                position: 'relative',
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.backgroundColor = STATUS_CONFIG[appointmentStatus]?.hoverColor || '#93c5fd';
                                                                setHoveredAppointment(appointment.AppID);
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.backgroundColor = getAppointmentCellStyle(appointmentStatus).backgroundColor;
                                                                setHoveredAppointment(null);
                                                            }}
                                                            onClick={() => {
                                                                setClickedAppointment(appointment)
                                                                setShowEditModal(true)
                                                            }}
                                                        >
                                                            <div style={styles.appointmentContent}>
                                                                <div style={styles.appointmentClient}>{customerName}</div>
                                                                <div style={styles.appointmentService}>{service.ServiceName}</div>
                                                                <div style={styles.serviceComment}>{service.ServiceComment} </div>
                                                            </div>

                                                            {/* Quick Action Buttons */}
                                                            {isHovered && (
                                                                <div style={styles.quickActionsContainer}>
                                                                    {(appointmentStatus === 'Open') && (
                                                                        <button
                                                                            style={styles.quickActionButton}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleQuickStatusChange(appointment, 'Pending');
                                                                            }}
                                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                                                                        >
                                                                            ✓ Check In
                                                                        </button>
                                                                    )}
                                                                    {(appointmentStatus === 'Pending') && (
                                                                        <button
                                                                            style={styles.quickActionButton}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleQuickStatusChange(appointment, 'Closed');
                                                                            }}
                                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
                                                                        >
                                                                            ✓ Complete
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
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
                                                        onClick={() => {
                                                            setClickedTime(slot.time)
                                                            setClickedTechID(tech.TechID)
                                                            setShowAddModal(true)
                                                        }}
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
                        <AppointmentAddModal
                            isOpen={showAddModal}
                            onClose={() => setShowAddModal(false)}
                            onSave={(handleAddAppointment)}
                            prefilledTechID={clickedTechID}
                            prefilledTime={clickedTime}
                            selectedDate={selectedDate}
                        />

                        <AppointmentEditModal
                            isOpen={showEditModal}
                            onClose={() => setShowEditModal(false)}
                            onSave={(handleEditAppointment)}
                            prefilledAppointment={clickedAppointment}
                        />

                    </>
                )}
            </div>
        </div >
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
        verticalAlign: 'center',
        cursor: 'pointer',
    },
    appointmentContent: {
        position: 'relative',
        zIndex: 1,
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
    serviceComment: {
        fontSize: '12px',
        color: '#6b7280',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    quickActionsContainer: {
        position: 'absolute',
        bottom: '4px',
        right: '4px',
        display: 'flex',
        gap: '4px',
        zIndex: 10,
    },
    quickActionButton: {
        padding: '4px 8px',
        fontSize: '11px',
        fontWeight: '500',
        color: '#ffffff',
        backgroundColor: '#10b981',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        whiteSpace: 'nowrap',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
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