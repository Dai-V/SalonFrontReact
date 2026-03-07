import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export default function TotalsByDayOfWeekChart({ data }) {
    const [chartOptions, setChartOptions] = useState(null);

    // Map day numbers to day names
    const dayNames = {
        2: 'Monday',
        3: 'Tuesday',
        4: 'Wednesday',
        5: 'Thursday',
        6: 'Friday',
        7: 'Saturday',
        1: 'Sunday',
    };

    // All days in order
    const allDays = [2, 3, 4, 5, 6, 7, 1];

    useEffect(() => {
        processData()
    }, [data]);

    const processData = () => {
        if (data && data.TotalsByDayOfWeek) {
            const dayTotalsMap = {};
            data.TotalsByDayOfWeek.forEach(item => {
                dayTotalsMap[item.DayOfWeek] = item.Total;
            });

            // Create arrays with all days, filling missing ones with 0
            const categories = allDays.map(day => dayNames[day]);
            const totals = allDays.map(day => dayTotalsMap[day] || 0);

            setChartOptions({
                chart: {
                    type: 'line',
                    backgroundColor: 'white',
                    borderRadius: 12,
                    style: {
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    },
                    spacing: [20, 20, 20, 20]

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
    }

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