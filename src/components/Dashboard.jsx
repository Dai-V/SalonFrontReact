import { useState, useEffect, use } from 'react';
import TotalsByDayOfWeekChart from './TotalsByDayOfWeekChart';

export default function Dashboard() {


    const apiURL = import.meta.env.VITE_API_URL;
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        fetchDashboard();
    }, []);


    const fetchDashboard = () => {
        fetch(apiURL + '/dashboard/', {
            method: 'GET',
            credentials: 'include',
        })
            .then(response => {
                return response.json()
            })
            .then(data => {
                console.log(data)
                setDashboardData(data);
            });
    }

    return (
        <>
            <TotalsByDayOfWeekChart data={dashboardData} />

        </>
    );
}

