import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar.jsx';
import Customers from '../components/Customers.jsx';
import Technicians from '../components/Technicians.jsx';

export default function Dashboard() {
    const [activePage, setActivePage] = useState('Dashboard');
    const [activeContent, setActiveContent] = useState('')
    const apiURL = import.meta.env.VITE_API_URL;
    const getCsrfToken = () => {
        fetch(apiURL + '/is_logged_in/', {
            method: 'GET',
            credentials: 'include',
        })
            .then(response => {
                console.log(response)
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
        getCsrfToken()
    }, [activePage]);

    const handleMenuItemClick = (itemName) => {
        setActivePage(itemName);
    };

    const handleLogout = () => {

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
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        marginLeft: '-1px',
        height: '3rem'
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