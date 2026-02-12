import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar.jsx';
import Customers from '../components/Customers.jsx';
import Technicians from '../components/Technicians.jsx';
import Appointments from '../components/Appointments.jsx';
import Dashboard from '../components/Dashboard.jsx';
import { Link, useNavigate } from "react-router-dom"
import SavedServices from '../components/SavedServices.jsx';

export default function Main() {
    const [activePage, setActivePage] = useState('Dashboard');
    const [activeContent, setActiveContent] = useState('')
    const apiURL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const getCsrfToken = () => {
        fetch(apiURL + '/is_logged_in/', {
            method: 'GET',
            credentials: 'include',
        })
            .then(response => {
                return response.json()
            })
            .then(data => {
                sessionStorage.setItem('csrfToken', data['X-CSRFToken']);
            });
    }
    useEffect(() => {
        if (activePage === 'Customers') {
            setActiveContent(<Customers />)
        }
        if (activePage === 'Technicians') {
            setActiveContent(<Technicians />)
        }
        if (activePage === 'Saved Services')
            setActiveContent(<SavedServices />)
        if (activePage === 'Appointments')
            setActiveContent(<Appointments />)
        if (activePage === 'Dashboard')
            setActiveContent(<Dashboard />)
        getCsrfToken()
    }, [activePage]);

    const handleMenuItemClick = (itemName) => {
        setActivePage(itemName);
    };

    const handleLogout = () => {
        fetch(apiURL + '/logout/', {
            method: 'POST',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': sessionStorage.getItem('csrfToken')
            }),
            credentials: 'include',
        }
        ).then(response => {
            sessionStorage.setItem('csrfToken', '')
            navigate('/login')
            return response.json();
        })
    };

    return (
        <div style={styles.container}>
            <NavBar
                activeItem={activePage}
                onMenuItemClick={handleMenuItemClick}
                onLogout={handleLogout}
            />

            <div style={styles.mainContent}>
                <div style={styles.contentHeader}>
                    <h1 style={styles.pageTitle}>{activePage}</h1>
                    <p style={styles.pageSubtitle}> </p>
                </div>

                <div style={styles.contentBody}>
                    {activeContent}
                </div>
            </div>
        </div >
    );
}

const styles = {
    container: {
        display: 'flex',
        height: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    mainContent: {
        flex: 1,
        backgroundColor: '#f9fafb',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
    },
    contentHeader: {
        padding: '1.65rem',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        marginLeft: '-1px',
    },
    pageTitle: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#111827',
        margin: '0 0 8px 0',
    },
    pageSubtitle: {
        fontSize: '16px',
        color: '#6b7280',
        margin: 0,
    },
    contentBody: {
        flex: 1,
        padding: '40px',
    },
};