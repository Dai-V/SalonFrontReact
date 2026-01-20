import { useState, useEffect } from 'react';
import TechAddModal from './TechAddModal.jsx'
import TechEditModal from './TechEditModal.jsx'
export default function Technicians() {
    const [techs, setTechs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredRow, setHoveredRow] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editTech, setEditTech] = useState('')
    const apiURL = import.meta.env.VITE_API_URL;

    const filteredTechs = techs.filter(tech =>
        tech.TechName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.TechEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.TechPhone.includes(searchTerm)
    );

    const handleRowClick = (techID) => {
        setEditTech(techs.find(tech => tech.TechID === techID))
        setShowEditModal(true)
    }

    const handleAddTech = (techData) => {
        fetch(apiURL + '/technicians/', {
            method: 'POST',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': sessionStorage.getItem('csrfToken')
            }),
            credentials: 'include',
            body: JSON.stringify({
                TechName: techData.name,
                TechPhone: techData.phone,
                TechEmail: techData.email,
                TechInfo: techData.info,
                TechAddress: techData.address,
            })
        }
        ).then(response => {
            if (response.ok) {
                getTechs()
                return response.json();
            }
        }).then (data => {
            if (techData.openSchedules)
                openSchedulesForNewTech(data.TechID)
        })

        setShowAddModal(false);
    };

    const openSchedulesForNewTech = (techID) => {
        const today = new Date();
        fetch(apiURL + '/technicians/' + techID + '/schedules/', {
            method: 'POST',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': sessionStorage.getItem('csrfToken')
            }),
            credentials: 'include',
            body: JSON.stringify({
                From: '2000-01-01',
                To: "2099-12-31",
                Availability: true,
                TechID: techID
            })
        }).then(response => {
            if (response.ok) {
                console.log("Schedules opened for new tech")
            }
        })
    };

    const handleEditTech = (techData) => {
        fetch(apiURL + '/technicians/' + editTech.TechID + '/', {
            method: 'PUT',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': sessionStorage.getItem('csrfToken')
            }),
            credentials: 'include',
            body: JSON.stringify({
                TechName: techData.name,
                TechPhone: techData.phone,
                TechEmail: techData.email,
                TechInfo: techData.info,
            })
        }
        ).then(response => {
            if (response.ok) {
                getTechs()
            }
            return response.json();
        })
        setShowEditModal(false);
    }



    const getTechs = () => {
        fetch(apiURL + '/technicians/', {
            method: 'GET',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }),
            credentials: 'include',
        }
        ).then(response => {
            return response.json();
        })
            .then(data => {
                setTechs(data)
            })
    }

    useEffect(() => {
        getTechs()
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Search techs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeaderRow}>
                            <th style={{ ...styles.tableHeader, width: '15%' }}>Name</th>
                            <th style={{ ...styles.tableHeader, width: '25%' }}>Email</th>
                            <th style={{ ...styles.tableHeader, width: '20%' }}>Phone</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTechs.map((tech) => (
                            <tr
                                key={tech.TechID}
                                style={{
                                    ...styles.tableRow,
                                    backgroundColor: hoveredRow === tech.TechID ? '#e8edf3ff' : '#ffffff',
                                    cursor: 'pointer',
                                }}
                                onClick={() => handleRowClick(tech.TechID)}
                                onMouseEnter={() => setHoveredRow(tech.TechID)}
                                onMouseLeave={() => setHoveredRow(null)}
                            >
                                <td style={styles.tableCell}>
                                    <div style={styles.nameCell}>
                                        <span style={styles.nameText}>{tech.TechName}</span>
                                    </div>
                                </td>
                                <td style={styles.tableCell}>{tech.TechEmail}</td>
                                <td style={styles.tableCell}>{tech.TechPhone}</td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={styles.footer}>
                <button style={styles.addButton} onClick={() => setShowAddModal(true)}>+ Add Tech</button>
                <p style={styles.footerText}>
                    Showing {filteredTechs.length} of {techs.length} techs
                </p>
            </div>
            <TechAddModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSave={handleAddTech}
            />
            <TechEditModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSave={handleEditTech}
                editTech={editTech}
            />

        </div>
    );
}

const styles = {
    container: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '0',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#111827',
        margin: '0 0 4px 0',
    },
    subtitle: {
        fontSize: '14px',
        color: '#6b7280',
        margin: 0,
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
        verticalAlign: 'left',
        textAlign: 'left'
    },
    nameCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    avatar: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: '#2563eb',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '600',
    },
    nameText: {
        fontWeight: '500',
        color: '#111827',
    },
    statusBadge: {
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        display: 'inline-block',
    },
    actions: {
        display: 'flex',
        gap: '8px',
    },
    editButton: {
        backgroundColor: 'transparent',
        color: '#2563eb',
        border: '1px solid #2563eb',
        borderRadius: '6px',
        padding: '6px 12px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    deleteButton: {
        backgroundColor: 'transparent',
        color: '#dc2626',
        border: '1px solid #dc2626',
        borderRadius: '6px',
        padding: '6px 12px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
};