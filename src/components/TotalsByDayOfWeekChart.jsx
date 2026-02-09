import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export default function TotalsByDayOfWeekChart({ data }) {
    const [chartOptions, setChartOptions] = useState(null);

    // Map day numbers to day names
    const dayNames = {
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday',
        7: 'Sunday',
    };

    // All days in order
    const allDays = [1, 2, 3, 4, 5, 6, 7];

    useEffect(() => {
        // Check if data exists
        if (data && data.TotalsByDayOfWeek) {
            // Create a map of day to total
            const dayTotalsMap = {};
            data.TotalsByDayOfWeek.forEach(item => {
                dayTotalsMap[item.DayOfWeek] = item.Total;
            });

            // Create arrays with all days, filling missing ones with 0
            const categories = allDays.map(day => dayNames[day]);
            const totals = allDays.map(day => dayTotalsMap[day] || 0);

            setChartOptions({
                chart: {
                    type: 'line'
                },
                title: {
                    text: 'Revenue by Day of Week'
                },
                xAxis: {
                    categories: categories,
                    title: {
                        text: 'Day of Week'
                    }
                },
                yAxis: {
                    title: {
                        text: 'Total Revenue ($)'
                    }
                },
                series: [{
                    name: 'Revenue',
                    data: totals,
                    color: '#2563eb',
                    marker: {
                        enabled: true,
                        radius: 4
                    },
                    dataLabels: {
                        enabled: true,
                        format: '${point.y:.2f}',
                        style: {
                            fontSize: '11px',
                            fontWeight: 'bold'
                        }
                    }
                }],
                tooltip: {
                    valuePrefix: '$',
                    valueDecimals: 2
                },
                credits: {
                    enabled: false
                }
            });
        }
    }, [data]);

    if (!chartOptions) {
        return <div>Loading chart...</div>;
    }

    return (
        <div style={{ width: '100%', height: '400px' }}>
            <HighchartsReact
                highcharts={Highcharts}
                options={chartOptions}
            />
        </div>
    );
}