import { useState, useEffect } from 'react';
import Select, { components } from 'react-select';
import CustomerAddModal from './CustomerAddModal';

export default function AppointmentEditModal({ isOpen, onClose, onSave, prefilledAppointment = '' }) {
    const [customers, setCustomers] = useState([]);
    const [savedServices, setSavedServices] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [paymentType, setPaymentType] = useState('cash');
    const [appStatus, setAppStatus] = useState('Open');
    const [showCustomerAddModal, setShowCustomerAddModal] = useState(false);
    const [services, setServices] = useState([]);

    const apiURL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (isOpen) {
            fetchCustomers();
            fetchSavedServices();
            fetchTechnicians();
            // Reset services with prefilled values when modal opens
            setServices(prefilledAppointment.Services ? prefilledAppointment.Services.map(s => ({
                ServiceName: s.ServiceName || '',
                ServiceCode: s.ServiceCode || '',
                ServiceStartTime: s.ServiceStartTime ? s.ServiceStartTime.slice(0, 5) : '',
                ServiceDuration: s.ServiceDuration || 30,
                ServicePrice: s.ServicePrice || 0,
                ServiceComment: s.ServiceComment || '',
                TechID: s.TechID ? s.TechID.toString() : ''
            })) : setServices([])) // Clear services when modal closes

            setSelectedCustomer(prefilledAppointment.CustomerID ? prefilledAppointment.CustomerID.CustomerID : '');
            setAppointmentDate(prefilledAppointment.AppDate || '');
            setPaymentType(prefilledAppointment.PaymentType || 'cash');
            setAppStatus(prefilledAppointment.AppStatus || 'Open');
        }
    }, [isOpen, prefilledAppointment]);

    const fetchCustomers = async () => {
        try {
            const response = await fetch(`${apiURL}/customers/`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            const data = await response.json();
            setCustomers(data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const fetchSavedServices = async () => {
        try {
            const response = await fetch(`${apiURL}/savedservices/`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            const data = await response.json();
            setSavedServices(data);
        } catch (error) {
            console.error('Error fetching saved services:', error);
        }
    };

    const fetchTechnicians = async () => {
        try {
            const response = await fetch(`${apiURL}/technicians/`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            const data = await response.json();
            setTechnicians(data);
        } catch (error) {
            console.error('Error fetching technicians:', error);
        }
    };

    const addService = () => {
        // Calculate next start time based on last service
        const lastService = services[services.length - 1];
        let nextStartTime = '';

        if (lastService.ServiceStartTime && lastService.ServiceDuration) {
            // Parse the time (HH:MM format)
            const [hours, minutes] = lastService.ServiceStartTime.split(':').map(Number);
            const totalMinutes = hours * 60 + minutes + parseInt(lastService.ServiceDuration);
            const nextHours = Math.floor(totalMinutes / 60);
            const nextMinutes = totalMinutes % 60;
            nextStartTime = `${nextHours.toString().padStart(2, '0')}:${nextMinutes.toString().padStart(2, '0')}`;
        }

        setServices([...services, {
            ServiceName: '',
            ServiceCode: '',
            ServiceStartTime: nextStartTime,
            ServiceDuration: 30,
            ServicePrice: 0,
            ServiceComment: '',
            TechID: lastService.TechID || ''
        }]);
    };

    const removeService = (index) => {
        if (services.length > 1) {
            setServices(services.filter((_, i) => i !== index));
        }
    };

    const updateService = (index, field, value) => {
        const updatedServices = [...services];
        updatedServices[index][field] = value;

        // If ServiceCode is changed, check if it matches a saved service
        if (field === 'ServiceCode' && value) {
            const savedService = savedServices.find(s => s.ServiceCode === value);
            if (savedService) {
                updatedServices[index]['ServiceName'] = savedService.ServiceName;
                updatedServices[index]['ServiceDuration'] = savedService.ServiceDuration;
                updatedServices[index]['ServicePrice'] = savedService.ServicePrice;
            }
        }

        setServices(updatedServices);
    };

    // Format options for React Select
    const customerOptions = customers.map(customer => ({
        value: customer.CustomerID,
        label: `${customer.CustomerFirstName} ${customer.CustomerLastName}`,
        phone: customer.CustomerPhone,
        searchString: `${customer.CustomerFirstName} ${customer.CustomerLastName} ${customer.CustomerPhone}`.toLowerCase()
    }));

    const technicianOptions = technicians.map(tech => ({
        value: tech.TechID,
        label: tech.TechName,
        searchString: tech.TechName.toLowerCase()
    }));

    const serviceCodeOptions = savedServices.map(service => ({
        value: service.ServiceCode,
        label: `${service.ServiceCode} - ${service.ServiceName}`,
        displayLabel: service.ServiceCode, // What to show when selected
        data: service,
        searchString: `${service.ServiceCode} ${service.ServiceName}`.toLowerCase()
    }));

    // Custom filter function for React Select
    const customFilter = (option, searchText) => {
        if (!searchText) return true;
        return option.data.searchString.includes(searchText.toLowerCase());
    };

    // Custom styles for React Select to match your design
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: '#ffffff',
            borderColor: state.isFocused ? '#2563eb' : '#e5e7eb',
            borderRadius: '6px',
            padding: '0px 4px',
            fontSize: '14px',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#2563eb'
            }
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? '#dbeafe' : '#ffffff',
            color: '#111827',
            fontSize: '14px',
            padding: '8px 12px',
            cursor: 'pointer',
            '&:active': {
                backgroundColor: '#93c5fd'
            }
        }),
        menu: (base) => ({
            ...base,
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            marginTop: '4px'
        }),
        menuList: (base) => ({
            ...base,
            padding: 0,
            borderRadius: '6px'
        }),
        singleValue: (base) => ({
            ...base,
            color: '#111827',
            fontSize: '14px',
            textAlign: 'left'
        }),
        placeholder: (base) => ({
            ...base,
            color: '#9ca3af',
            fontSize: '14px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        }),
        input: (base) => ({
            ...base,
            color: '#111827',
            fontSize: '14px'
        })
    };

    // Custom option component to show phone number
    const CustomerOption = ({ data, ...props }) => (
        <div {...props.innerProps} style={{
            padding: '8px 12px',
            backgroundColor: props.isFocused ? '#dbeafe' : '#ffffff',
            cursor: 'pointer',
            fontSize: '14px'
        }}>
            <div style={{ fontWeight: '500', color: '#111827', textAlign: 'left' }}>{data.label}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'left' }}>{data.phone}</div>
        </div>
    );

    // Custom single value component to show only ServiceCode when selected
    const ServiceCodeSingleValue = (props) => (
        <components.SingleValue {...props}>
            {props.data.displayLabel || props.data.value}
        </components.SingleValue>
    );

    // Payment type options
    const paymentTypeOptions = [
        { value: 'cash', label: 'Cash' },
        { value: 'credit_card', label: 'Credit Card' },
        { value: 'debit_card', label: 'Debit Card' },
        { value: 'check', label: 'Check' }
    ];

    const appStatusOptions = [
        { value: 'Open', label: 'Scheduled' },
        { value: 'Pending', label: 'Checked In' },
        { value: 'Closed', label: 'Closed' },
        { value: 'Cancelled', label: 'Cancelled' }
    ];

    const loadSavedService = (index, savedServiceId) => {
        const savedService = savedServices.find(s => s.ServiceID === parseInt(savedServiceId));
        if (savedService) {
            updateService(index, 'ServiceName', savedService.ServiceName);
            updateService(index, 'ServiceCode', savedService.ServiceCode);
            updateService(index, 'ServiceDuration', savedService.ServiceDuration);
            updateService(index, 'ServicePrice', savedService.ServicePrice);
        }
    };

    const calculateTotal = () => {
        return services.reduce((sum, service) => sum + parseFloat(service.ServicePrice || 0), 0).toFixed(2);
    };

    const handleSubmit = () => {
        if (!selectedCustomer) {
            alert('Please select a customer');
            return;
        }

        const hasInvalidService = services.some(s =>
            !s.ServiceName || !s.ServiceCode || !s.ServiceStartTime || !s.TechID
        );

        if (hasInvalidService) {
            alert('Please fill in all required service fields');
            return;
        }

        const appointmentData = {
            AppDate: appointmentDate,
            AppTotal: calculateTotal(),
            PaymentType: paymentType,
            AppStatus: appStatus,
            CustomerID: parseInt(selectedCustomer),
            Services: services.map(s => ({
                ServiceName: s.ServiceName,
                ServiceCode: s.ServiceCode,
                ServiceStartTime: s.ServiceStartTime + ':00',
                ServiceDuration: parseInt(s.ServiceDuration),
                ServicePrice: parseFloat(s.ServicePrice),
                ServiceComment: s.ServiceComment,
                TechID: parseInt(s.TechID)
            }))
        };

        onSave(appointmentData);
        handleClose();
    };

    const handleClose = () => {
        setSelectedCustomer('');
        setPaymentType('cash');
        setServices([{
            ServiceName: '',
            ServiceCode: '',
            ServiceStartTime: '',
            ServiceDuration: 30,
            ServicePrice: 0,
            TechID: '',
            ServiceComment: ''
        }]);
        onClose();
    };

    const handleAddCustomer = (customerData) => {
        const apiURL = import.meta.env.VITE_API_URL;
        fetch(apiURL + '/customers/', {
            method: 'POST',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': sessionStorage.getItem('csrfToken')
            }),
            credentials: 'include',
            body: JSON.stringify({
                CustomerFirstName: customerData.firstName,
                CustomerLastName: customerData.lastName,
                CustomerEmail: customerData.email,
                CustomerPhone: customerData.phone,
                CustomerAddress: customerData.address,
                CustomerInfo: customerData.info,
            })
        }).then(response => {
            if (response.ok) {
                return response.json();
            }
        }).then(data => {
            if (data) {
                // Refresh customers list and select the new customer
                fetchCustomers();
                setSelectedCustomer(data.CustomerID.toString());
                setShowCustomerAddModal(false);
            }
        }).catch(error => {
            console.error('Error adding customer:', error);
        });
    };

    if (!isOpen) return null;

    return (
        <div style={styles.modalOverlay} onClick={handleClose}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h3 style={styles.modalTitle}>Edit Appointment</h3>
                    <button style={styles.closeButton} onClick={handleClose}>×</button>
                </div>

                <div style={styles.modalBody}>
                    <div style={styles.formRow}>
                        <div style={{ ...styles.formGroup, flex: '0 0 calc(37% - 8px)' }}>
                            <label style={styles.label}>Customer</label>
                            <div style={{ position: 'relative' }}>
                                <Select
                                    options={customerOptions}
                                    value={customerOptions.find(opt => opt.value === parseInt(selectedCustomer)) || null}
                                    onChange={(option) => setSelectedCustomer(option ? option.value.toString() : '')}
                                    styles={selectStyles}
                                    placeholder="Search by name or phone"
                                    isClearable
                                    isSearchable
                                    filterOption={customFilter}
                                    components={{ Option: CustomerOption }}
                                />
                                <button
                                    style={styles.newCustomerButton}
                                    onClick={() => setShowCustomerAddModal(true)}
                                    type="button"
                                >
                                    + New
                                </button>
                            </div>
                        </div>

                        <div style={{ ...styles.formGroup, flex: '0 0 calc(15% - 8px)' }}>
                            <label style={styles.label}>Date</label>
                            <input
                                type="date"
                                style={styles.input}
                                value={appointmentDate}
                                onChange={(e) => setAppointmentDate(e.target.value)}
                            />
                        </div>

                        <div style={{ ...styles.formGroup, flex: '0 0 calc(25% - 8px)' }}>
                            <label style={styles.label}>Status</label>
                            <Select
                                options={appStatusOptions}
                                value={appStatusOptions.find(opt => opt.value === appStatus) || appStatusOptions[0]}
                                onChange={(option) => setAppStatus(option ? option.value : 'Open')}
                                styles={selectStyles}
                                isSearchable={false}
                            />
                        </div>

                        <div style={{ ...styles.formGroup, flex: '0 0 calc(15% - 8px)' }}>
                            <label style={styles.label}>Payment Type</label>
                            <Select
                                options={paymentTypeOptions}
                                value={paymentTypeOptions.find(opt => opt.value === paymentType) || paymentTypeOptions[0]}
                                onChange={(option) => setPaymentType(option ? option.value : 'cash')}
                                styles={selectStyles}
                                isSearchable={false}
                            />
                        </div>
                    </div>

                    {/* Services */}
                    <div style={styles.servicesSection}>
                        <div style={styles.servicesSectionHeader}>
                            <h4 style={styles.servicesTitle}>Services</h4>
                            <button style={styles.addServiceButton} onClick={addService}>
                                + Add Service
                            </button>
                        </div>

                        {services.map((service, index) => (
                            <div key={index} style={styles.serviceCard}>
                                <div style={styles.serviceCardHeader}>
                                    <span style={styles.serviceNumber}>Service {index + 1}</span>
                                    {services.length > 1 && (
                                        <button
                                            style={styles.removeServiceButton}
                                            onClick={() => removeService(index)}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>



                                <div style={styles.formRow}>
                                    <div style={{ ...styles.formGroup, flex: '1' }}>
                                        <label style={styles.label}>Service Code</label>
                                        <Select
                                            options={serviceCodeOptions}
                                            value={serviceCodeOptions.find(opt => opt.value === service.ServiceCode) || (service.ServiceCode ? { value: service.ServiceCode, label: service.ServiceCode, displayLabel: service.ServiceCode } : null)}
                                            onChange={(option) => {
                                                if (option && option.data) {
                                                    updateService(index, 'ServiceCode', option.value);
                                                    updateService(index, 'ServiceName', option.data.ServiceName);
                                                    updateService(index, 'ServiceDuration', option.data.ServiceDuration);
                                                    updateService(index, 'ServicePrice', option.data.ServicePrice);
                                                } else if (option) {
                                                    updateService(index, 'ServiceCode', option.value);
                                                } else {
                                                    updateService(index, 'ServiceCode', '');
                                                }
                                            }}
                                            onInputChange={(inputValue, actionMeta) => {
                                                if (actionMeta.action === 'input-change') {
                                                    updateService(index, 'ServiceCode', inputValue);
                                                }
                                            }}
                                            styles={selectStyles}
                                            placeholder="Enter or select service code"
                                            isClearable
                                            isSearchable
                                            filterOption={customFilter}
                                            components={{ SingleValue: ServiceCodeSingleValue }}
                                        />
                                    </div>
                                    <div style={{ ...styles.formGroup, flex: '1' }}>
                                        <label style={styles.label}>Service Name</label>
                                        <input
                                            type="text"
                                            style={styles.input}
                                            value={service.ServiceName}
                                            onChange={(e) => updateService(index, 'ServiceName', e.target.value)}
                                            placeholder="Enter service name"
                                        />
                                    </div>



                                    <div style={{ ...styles.formGroup, flex: '1' }}>
                                        <label style={styles.label}>Technician</label>
                                        <Select
                                            options={technicianOptions}
                                            value={technicianOptions.find(opt => opt.value === parseInt(service.TechID)) || null}
                                            onChange={(option) => updateService(index, 'TechID', option ? option.value.toString() : '')}
                                            styles={selectStyles}
                                            placeholder="Search technician by name"
                                            isClearable
                                            isSearchable
                                            filterOption={customFilter}
                                        />
                                    </div>
                                </div>

                                <div style={styles.formRow}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Start Time</label>
                                        <input
                                            type="time"
                                            style={styles.input}
                                            value={service.ServiceStartTime}
                                            onChange={(e) => updateService(index, 'ServiceStartTime', e.target.value)}
                                        />
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Duration (min)</label>
                                        <input
                                            type="number"
                                            style={styles.input}
                                            value={service.ServiceDuration}
                                            onChange={(e) => updateService(index, 'ServiceDuration', e.target.value)}
                                            min="15"
                                            step="15"
                                        />
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Price</label>
                                        <input
                                            type="number"
                                            style={styles.input}
                                            value={service.ServicePrice}
                                            onChange={(e) => updateService(index, 'ServicePrice', e.target.value)}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>

                                <div style={styles.formRow}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Comment/Note</label>
                                        <input
                                            type="text"
                                            style={styles.input}
                                            value={service.ServiceComment}
                                            onChange={(e) => updateService(index, 'ServiceComment', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div style={styles.totalSection}>
                        <span style={styles.totalLabel}>Total:</span>
                        <span style={styles.totalAmount}>${calculateTotal()}</span>
                    </div>
                </div>

                <div style={styles.modalFooter}>
                    <button style={styles.cancelButton} onClick={handleClose}>
                        Cancel
                    </button>
                    <button style={styles.saveButton} onClick={handleSubmit}>
                        Save Appointment
                    </button>
                </div>

                {/* Customer Add Modal */}
                <CustomerAddModal
                    isOpen={showCustomerAddModal}
                    onClose={() => setShowCustomerAddModal(false)}
                    onSave={handleAddCustomer}
                />
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
        zIndex: 1001,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
    formGroup: {
        marginBottom: '16px',
        flex: 1,
    },
    formRow: {
        display: 'flex',
        gap: '16px',
    },
    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '6px',
    },
    input: {
        width: '100%',
        padding: '8px 12px',
        fontSize: '14px',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        outline: 'none',
        boxSizing: 'border-box',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#ffffff',
        color: '#111827',
    },
    select: {
        width: '100%',
        padding: '8px 12px',
        fontSize: '14px',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        outline: 'none',
        boxSizing: 'border-box',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#ffffff',
        color: '#111827',
    },
    servicesSection: {
        marginTop: '24px',
    },
    servicesSectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
    },
    servicesTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#111827',
        margin: 0,
    },
    addServiceButton: {
        backgroundColor: '#2563eb',
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    serviceCard: {
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
    },
    serviceCardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
    },
    serviceNumber: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#111827',
    },
    removeServiceButton: {
        backgroundColor: 'transparent',
        color: '#dc2626',
        border: '1px solid #dc2626',
        borderRadius: '6px',
        padding: '4px 12px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    totalSection: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        marginTop: '24px',
    },
    totalLabel: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151',
    },
    totalAmount: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#2563eb',
    },
    modalFooter: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        padding: '16px 24px 24px 24px',
        borderTop: '1px solid #e5e7eb',
    },
    cancelButton: {
        backgroundColor: '#ffffff',
        color: '#374151',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    saveButton: {
        backgroundColor: '#2563eb',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    newCustomerButton: {
        position: 'absolute',
        right: '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        backgroundColor: '#ffffff',
        color: '#2563eb',
        border: '1px solid #2563eb',
        borderRadius: '6px',
        padding: '4px 10px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        transition: 'all 0.2s',
        zIndex: 10,
    },
};