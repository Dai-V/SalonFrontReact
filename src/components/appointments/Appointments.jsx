import { useState, useEffect, useMemo, useRef } from 'react';
import AppointmentAddModal from './AppointmentAddModal';
import AppointmentEditModal from './AppointmentEditModal';
import DraggableAppointmentCell from './DraggableAppointmentCell';
import DroppableCell from './DroppableCell';
import ErrorMessagePopup from '../ErrorMessagePopup.jsx';
import Calendar from '../Calendar.jsx';
import { formatLocalDate } from '../../utils/dateUtils.js';
import { DragDropProvider } from '@dnd-kit/react';

function generateTimeSlots() {
    const slots = [];
    for (let hour = 6; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const displayTime = `${(hour > 12 ? hour - 12 : hour)}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
            slots.push({ time, displayTime });
        }
    }
    return slots;
}

const TIME_SLOTS = generateTimeSlots();

const STATUS_CONFIG = {
    Open: { backgroundColor: '#dbeafe', hoverColor: '#93c5fd', borderColor: '#3b82f6' },
    Closed: { backgroundColor: '#e5e7eb', hoverColor: '#d1d5db', borderColor: '#6b7280' },
    Pending: { backgroundColor: '#d1fae5', hoverColor: '#a7f3d0', borderColor: '#10b981' },
};

const getAppointmentCellStyle = (status) => ({
    ...styles.appointmentCell,
    backgroundColor: STATUS_CONFIG[status]?.backgroundColor || '#dbeafe',
    boxShadow: `inset 2px 0 0 ${STATUS_CONFIG[status]?.borderColor || '#3b82f6'}`,
});


export default function Appointments() {
    const [technicians, setTechnicians] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [clickedTime, setClickedTime] = useState('');
    const [clickedTechID, setClickedTechID] = useState('');
    const [clickedAppointment, setClickedAppointment] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [hoveredAppointment, setHoveredAppointment] = useState(null);
    const [hoveredCell, setHoveredCell] = useState(null);
    const apiURL = import.meta.env.VITE_API_URL;
    const tableContainerRef = useRef(null);



    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    const updateAppointment = async (appointmentId, appointmentData) => {
        const res = await fetch(`${apiURL}/appointments/${appointmentId}/`, {
            method: 'PUT',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': sessionStorage.getItem('csrfToken'),
            }),
            credentials: 'include',
            body: JSON.stringify(appointmentData),
        });

        if (res.ok) { fetchTechnicians(); return true; }
        if (res.status === 409) {
            const data = await res.json();
            setErrorMessage(data.detail || 'This time slot is already booked. Please choose a different time.');
            return false;
        }
    };


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
                'X-CSRFToken': sessionStorage.getItem('csrfToken'),
            }),
            credentials: 'include',
            body: JSON.stringify(appointmentData),
        }).then(response => {
            if (response.ok) { fetchTechnicians(); setHoveredAppointment(null); }
        });
    };

    useEffect(() => { fetchTechnicians(); }, [selectedDate]);

    useEffect(() => {
        if (!loading && tableContainerRef.current) {
            const now = new Date();
            const roundedMinute = Math.floor(now.getMinutes() / 15) * 15;
            const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${roundedMinute.toString().padStart(2, '0')}`;
            const currentSlotIndex = TIME_SLOTS.findIndex(slot => slot.time === currentTimeStr);
            if (currentSlotIndex !== -1) {
                tableContainerRef.current.scrollTop = currentSlotIndex * 24.5;
            }
        }
    }, []);

    const getCurrentTimePosition = () => {
        const now = currentTime;
        const h = now.getHours();
        const m = now.getMinutes();
        if (h < 6 || h >= 18) return null;
        return ((h - 6) * 60 + m) / 15 * 24.5 + 42.5;
    };

    const handleAddAppointment = async (appointmentData) => {
        const res = await fetch(`${apiURL}/appointments/`, {
            method: 'POST',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': sessionStorage.getItem('csrfToken'),
            }),
            credentials: 'include',
            body: JSON.stringify(appointmentData),
        });

        if (res.ok) { fetchTechnicians(); return true; }
        if (res.status === 409) {
            res.json().then(data => setErrorMessage(data.detail || 'This time slot is already booked. Please choose a different time.'));
            return false;
        }
    };

    const handleEditAppointment = (appointmentData) => {
        return updateAppointment(clickedAppointment.AppID, appointmentData);
    };

    const fetchTechnicians = async () => {
        // setLoading(true);
        try {
            const dateStr = formatLocalDate(selectedDate);
            const [techRes, apptRes] = await Promise.all([
                fetch(`${apiURL}/technicians/?Date=${dateStr}`, { method: 'GET', headers: new Headers({ 'Accept': 'application/json', 'Content-Type': 'application/json' }), credentials: 'include' }),
                fetch(`${apiURL}/appointments/?Date=${dateStr}`, { method: 'GET', headers: new Headers({ 'Accept': 'application/json', 'Content-Type': 'application/json' }), credentials: 'include' }),
            ]);
            setTechnicians(await techRes.json());
            setAppointments(await apptRes.json());
        } catch (err) {
            console.error('Error fetching data:', err);
        }
        // setLoading(false);
    };

    const getServiceForSlot = (techId, timeSlot) => {
        for (const apt of appointments) {
            if (apt.Services) {
                const service = apt.Services.find(s =>
                    s.TechID === techId && s.ServiceStartTime.substring(0, 5) === timeSlot
                );
                if (service) return { appointment: apt, service };
            }
        }
        return null;
    };

    const calculateSlotSpan = (service) => Math.ceil(service.ServiceDuration / 15);

    const buildAppointmentMap = () => {
        const map = {};
        technicians.forEach(tech => {
            map[tech.TechID] = {};
            TIME_SLOTS.forEach((slot, index) => {
                const result = getServiceForSlot(tech.TechID, slot.time);
                if (result) {
                    const span = calculateSlotSpan(result.service);
                    map[tech.TechID][index] = { result, span };
                    for (let i = 1; i < span; i++) map[tech.TechID][index + i] = { covered: true };
                }
            });
        });
        return map;
    };

    const appointmentMap = useMemo(() => buildAppointmentMap(), [appointments, technicians]);


    // ─── Drag end: move service to new tech + time slot ─────────────────────
    const handleDragEnd = (event) => {
        setHoveredCell(null);
        if (event.canceled) return;
        const { source, target } = event.operation;
        if (!source || !target) return;

        const [, appId, serviceId] = source.id.split('-');
        const [, newTechId, newTime] = target.id.split('-');
        if (!appId || !newTechId || !newTime) return;

        const appointment = appointments.find(a => String(a.AppID) === appId);
        if (!appointment) return;

        const updatedServices = appointment.Services.map(s =>
            String(s.ServiceID) === serviceId
                ? { ...s, TechID: Number(newTechId), ServiceStartTime: `${newTime}:00` }
                : s
        );

        updateAppointment(appointment.AppID, {
            ...appointment,
            CustomerID: appointment.CustomerID.CustomerID,
            Services: updatedServices,
        });
    };

    return (
        <div style={styles.container}>
            <Calendar
                selectedDate={selectedDate}
                onDateChange={(date) => setSelectedDate(date)}
            />

            <ErrorMessagePopup
                isOpen={!!errorMessage}
                onClose={() => setErrorMessage(null)}
                title="Scheduling Conflict"
                message={errorMessage}
            />

            <DragDropProvider
                onDragEnd={handleDragEnd}
                onDragOver={(event) => {
                    setHoveredCell(event.operation?.target?.id ?? null);
                }}
            >
                <div style={styles.tableContainer} ref={tableContainerRef}>
                    {loading ? (
                        <div style={styles.loadingContainer}>
                            <div style={styles.loadingText}>Loading...</div>
                        </div>
                    ) : technicians.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyStateIcon}>📅</div>
                            <h3 style={styles.emptyStateTitle}>No Technicians Scheduled</h3>
                            <p style={styles.emptyStateSubtitle}>There are no technicians scheduled for this day. Add a technician schedule to start booking appointments.</p>
                        </div>
                    ) :

                        (
                            <>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={styles.tableHeaderRow}>
                                            <th style={styles.tableHeaderTime}>Time</th>
                                            {technicians.map(tech => (
                                                <th key={tech.TechID} style={{
                                                    ...styles.tableHeader,
                                                    width: `calc((100% - 100px) / ${technicians.length})`,
                                                }}>
                                                    {tech.TechName}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {TIME_SLOTS.map((slot, index) => {
                                            const isHourMark = slot.time.endsWith(':00');
                                            const isHalfHour = slot.time.endsWith(':30');

                                            return (
                                                <tr key={slot.time} style={styles.tableRow}>
                                                    <td style={{
                                                        ...styles.timeCell,
                                                        backgroundColor: (isHourMark || isHalfHour) ? '#f3f4f6' : '#f9fafb',
                                                    }}>
                                                        {isHourMark || isHalfHour ? slot.displayTime : '\u00A0'}
                                                    </td>

                                                    {technicians.map(tech => {
                                                        const cellInfo = appointmentMap[tech.TechID][index];

                                                        if (cellInfo?.covered) return null;

                                                        if (cellInfo?.result) {
                                                            const { appointment, service } = cellInfo.result;
                                                            const customerName = appointment.CustomerID
                                                                ? `${appointment.CustomerID.CustomerFirstName || ''} ${appointment.CustomerID.CustomerLastName || ''}`.trim()
                                                                : 'Unknown Customer';
                                                            const appointmentStatus = appointment.AppStatus || 'Open';
                                                            const isHovered = hoveredAppointment === appointment.AppID;
                                                            const draggableId = `apt-${appointment.AppID}-${service.ServiceID}`;

                                                            return (
                                                                <DraggableAppointmentCell
                                                                    key={tech.TechID}
                                                                    id={draggableId}
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
                                                                        setClickedAppointment(appointment);
                                                                        setShowEditModal(true);
                                                                    }}
                                                                >
                                                                    <div style={styles.appointmentContent}>
                                                                        <div style={styles.appointmentClient}>{customerName}</div>
                                                                        <div style={styles.appointmentService}>{service.ServiceName}</div>
                                                                        <div style={styles.serviceComment}>{service.ServiceComment}</div>
                                                                    </div>

                                                                    {isHovered && (
                                                                        <div style={styles.quickActionsContainer}>
                                                                            {appointmentStatus === 'Open' && (
                                                                                <button
                                                                                    style={styles.quickActionButton}
                                                                                    onClick={(e) => { e.stopPropagation(); handleQuickStatusChange(appointment, 'Pending'); }}
                                                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                                                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                                                                                >✓ Check In</button>
                                                                            )}
                                                                            {appointmentStatus === 'Pending' && (
                                                                                <button
                                                                                    style={styles.quickActionButton}
                                                                                    onClick={(e) => { e.stopPropagation(); handleQuickStatusChange(appointment, 'Closed'); }}
                                                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                                                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
                                                                                >✓ Complete</button>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </DraggableAppointmentCell>
                                                            );
                                                        }

                                                        // Empty droppable cell
                                                        const droppableId = `cell-${tech.TechID}-${slot.time}`;
                                                        return (
                                                            <DroppableCell
                                                                key={tech.TechID}
                                                                id={droppableId}
                                                                style={{
                                                                    ...styles.tableCell,
                                                                    backgroundColor: (isHourMark || isHalfHour) ? '#f9fafb' : 'transparent',
                                                                }}
                                                                isOver={hoveredCell === droppableId}
                                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0f2fe'}
                                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = (isHourMark || isHalfHour) ? '#f9fafb' : 'transparent'}
                                                                onClick={() => {
                                                                    setClickedTime(slot.time);
                                                                    setClickedTechID(tech.TechID);
                                                                    setShowAddModal(true);
                                                                }}
                                                            />
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
                                        left: 0, right: 0,
                                        height: '2px',
                                        backgroundColor: '#ef4444',
                                        zIndex: 15,
                                        pointerEvents: 'none',
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            left: '0', top: '-4px',
                                            width: '8px', height: '8px',
                                            backgroundColor: '#ef4444',
                                            borderRadius: '50%',
                                        }} />
                                    </div>
                                )}

                                <AppointmentAddModal
                                    isOpen={showAddModal}
                                    onClose={() => setShowAddModal(false)}
                                    onSave={handleAddAppointment}
                                    prefilledTechID={clickedTechID}
                                    prefilledTime={clickedTime}
                                    selectedDate={selectedDate}
                                />
                                <AppointmentEditModal
                                    isOpen={showEditModal}
                                    onClose={() => setShowEditModal(false)}
                                    onSave={handleEditAppointment}
                                    prefilledAppointment={clickedAppointment}
                                />
                            </>
                        )}
                </div>
            </DragDropProvider>
        </div>
    );
}

const styles = {
    container: {
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
    table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
    tableHeaderRow: { backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' },
    tableHeader: {
        padding: '12px 16px', textAlign: 'center', fontSize: '12px',
        fontWeight: '600', color: '#6b7280', textTransform: 'uppercase',
        letterSpacing: '0.05em', whiteSpace: 'nowrap',
        position: 'sticky', top: 0, backgroundColor: '#f9fafb', zIndex: 10,
    },
    tableHeaderTime: {
        padding: '12px 16px', textAlign: 'center', fontSize: '12px',
        fontWeight: '600', color: '#6b7280', textTransform: 'uppercase',
        letterSpacing: '0.05em', whiteSpace: 'nowrap',
        position: 'sticky', top: 0, left: 0, backgroundColor: '#f9fafb', zIndex: 20,
        width: '100px', minWidth: '100px',
    },
    tableRow: { borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.2s' },
    timeCell: {
        padding: '2px 16px', fontSize: '13px', fontWeight: '500', color: '#374151',
        backgroundColor: '#f9fafb', whiteSpace: 'nowrap', borderRight: '1px solid #e5e7eb',
        position: 'sticky', left: 0, zIndex: 5,
        width: '100px', minWidth: '100px', maxWidth: '100px',
    },
    tableCell: {
        padding: '2px 16px', fontSize: '14px', color: '#374151',
        borderRight: '1px solid #e5e7eb', verticalAlign: 'top',
        cursor: 'pointer', transition: 'background-color 0.2s',
    },
    appointmentCell: {
        padding: '2px 16px', fontSize: '14px', color: '#374151', verticalAlign: 'center',
    },
    appointmentContent: { position: 'relative', zIndex: 1 },
    appointmentClient: { fontWeight: '500', color: '#111827', marginBottom: '4px' },
    appointmentService: { fontSize: '12px', color: '#1f2937', marginBottom: '2px' },
    serviceComment: {
        fontSize: '12px', color: '#6b7280',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    },
    quickActionsContainer: {
        position: 'absolute', bottom: '4px', right: '4px',
        display: 'flex', gap: '4px', zIndex: 10,
    },
    quickActionButton: {
        padding: '4px 8px', fontSize: '11px', fontWeight: '500',
        color: '#ffffff', backgroundColor: '#10b981',
        border: 'none', borderRadius: '4px', cursor: 'pointer',
        transition: 'background-color 0.2s', whiteSpace: 'nowrap',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    },
    loadingContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' },
    loadingText: { fontSize: '14px', color: '#6b7280' },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 32px',
        textAlign: 'center',
    },
    emptyStateIcon: {
        fontSize: '48px',
        marginBottom: '16px',
    },
    emptyStateTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#111827',
        margin: '0 0 8px 0',
    },
    emptyStateSubtitle: {
        fontSize: '14px',
        color: '#6b7280',
        maxWidth: '320px',
        lineHeight: '1.5',
        margin: 0,
    },
};