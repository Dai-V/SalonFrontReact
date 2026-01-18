import { useState, useEffect } from 'react';
import SavedServiceAddModal from './SavedServiceAddModal';

export default function SavedServices() {
    const [services, setServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredRow, setHoveredRow] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editService, setEditService] = useState('')
    const apiURL = import.meta.env.VITE_API_URL;

    const filteredServices = services.filter(service =>
        service.ServiceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.ServiceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.ServiceDescription?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddService = (serviceData) => {
        fetch(apiURL + '/savedservices/', {
            method: 'POST',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': sessionStorage.getItem('csrfToken')
            }),
            credentials: 'include',
            body: JSON.stringify({
                ServiceCode: serviceData.code.toUpperCase(),
                ServiceName: serviceData.name,
                ServicePrice: serviceData.price,
                ServiceDuration: serviceData.duration,
                ServiceDescription: serviceData.description
            })
        }
        ).then(response => {
            if (response.ok) {
                getServices()
            }
            return response.json();
        })
        setShowAddModal(false);
    };

    const handleRowClick = (serviceID) => {
        console.log('Service clicked:', serviceID);
        // Add your row click logic here
    };

    const getServices = () => {
        fetch(apiURL + '/savedservices/', {
            method: 'GET',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }),
            credentials: 'include',
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                setServices(data);
            })
            .catch(error => {
                console.error('Error fetching services:', error);
            });
    };

    useEffect(() => {
        getServices();
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeaderRow}>
                            <th style={{ ...styles.tableHeader, width: '15%' }}>Code</th>
                            <th style={{ ...styles.tableHeader, width: '25%' }}>Name</th>
                            <th style={{ ...styles.tableHeader, width: '12%' }}>Price</th>
                            <th style={{ ...styles.tableHeader, width: '12%' }}>Duration</th>
                            <th style={{ ...styles.tableHeader, width: '36%' }}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredServices.map((service) => (
                            <tr
                                key={service.ServiceID}
                                style={{
                                    ...styles.tableRow,
                                    backgroundColor: hoveredRow === service.ServiceID ? '#e8edf3ff' : '#ffffff',
                                    cursor: 'pointer',
                                }}
                                onClick={() => handleRowClick(service.ServiceID)}
                                onMouseEnter={() => setHoveredRow(service.ServiceID)}
                                onMouseLeave={() => setHoveredRow(null)}
                            >
                                <td style={styles.tableCell}>
                                    <div style={styles.codeCell}>
                                        <span style={styles.codeText}>{service.ServiceCode}</span>
                                    </div>
                                </td>
                                <td style={styles.tableCell}>
                                    <span style={styles.nameText}>{service.ServiceName}</span>
                                </td>
                                <td style={styles.tableCell}>
                                    <span style={styles.priceText}>
                                        ${parseFloat(service.ServicePrice).toFixed(2)}
                                    </span>
                                </td>
                                <td style={styles.tableCell}>
                                    <span style={styles.durationText}>
                                        {service.ServiceDuration} min
                                    </span>
                                </td>
                                <td style={styles.tableCell}>
                                    <span style={styles.descriptionText}>
                                        {service.ServiceDescription || '-'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={styles.footer}>
                <button style={styles.addButton} onClick={() => setShowAddModal(true)}>+ Add Service</button>
                <p style={styles.footerText}>
                    Showing {filteredServices.length} of {services.length} services
                </p>
            </div>
            <SavedServiceAddModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSave={handleAddService}
                services={services}
            />
        </div>
    );
}

const styles = {
    container: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '0',
    },
    searchContainer: {
        marginBottom: '20px',
    },
    searchInput: {
        width: '100%',
        maxWidth: '400px',
        padding: '10px 16px',
        fontSize: '14px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        outline: 'none',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: 'black'
    },
    tableContainer: {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        maxHeight: '60vh',      // ← limit height
        overflowY: 'auto',       // ← enable vertical scroll
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
        textAlign: 'left',
        fontSize: '12px',
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    tableRow: {
        borderBottom: '1px solid #e5e7eb',
        transition: 'background-color 0.2s',
    },
    tableCell: {
        padding: '16px',
        fontSize: '14px',
        color: '#374151',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        verticalAlign: 'middle',
        textAlign: 'left'
    },
    codeCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    codeText: {
        fontWeight: '600',
        color: '#2563eb',
        backgroundColor: '#dbeafe',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '13px',
    },
    nameText: {
        fontWeight: '500',
        color: '#111827',
    },
    priceText: {
        fontWeight: '600',
        color: '#059669',
        fontSize: '15px',
    },
    durationText: {
        color: '#6b7280',
        fontSize: '13px',
    },
    descriptionText: {
        color: '#6b7280',
        fontSize: '13px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'block',
    },
    footer: {
        marginTop: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerText: {
        fontSize: '14px',
        color: '#6b7280',
    },
    addButton: {
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
};