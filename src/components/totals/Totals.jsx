import { useState, useEffect, useMemo } from 'react';
import { formatLocalDate } from '../../utils/dateUtils.js';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
}

function DatePicker({ label, value, onChange }) {
    const dateObj = value ? new Date(value + 'T00:00:00') : null;

    return (
        <div style={styles.datePickerWrapper}>
            <label style={styles.dateLabel}>{label}</label>
            <ReactDatePicker
                selected={dateObj}
                onChange={(date) => {
                    if (date) onChange(formatLocalDate(date));
                }}
                dateFormat="MM/dd/yyyy"
                customInput={<input style={styles.dateInput} readOnly />}
            />
        </div>
    );
}

function StatCard({ label, value, accent }) {
    return (
        <div style={{ ...styles.statCard, borderTopColor: accent }}>
            <div style={styles.statValue}>{value}</div>
            <div style={styles.statLabel}>{label}</div>
        </div>
    );
}

const PAYMENT_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899',
];

export default function Totals() {
    const today = formatLocalDate(new Date());
    const [fromDate, setFromDate] = useState(today);
    const [toDate, setToDate] = useState(today);
    const [totalData, setTotalData] = useState(null);
    const [loading, setLoading] = useState(false);
    const apiURL = import.meta.env.VITE_API_URL;

    const isSingleDay = fromDate === toDate;

    useEffect(() => { fetchData(); }, [fromDate, toDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch(apiURL + '/totals/?StartDate=' + fromDate + '&EndDate=' + toDate, {
                method: 'GET',
                headers: new Headers({ 'Accept': 'application/json', 'Content-Type': 'application/json' }),
                credentials: 'include',
            });
            const data = await response.json();
            setTotalData(data);
        } catch (err) {
            console.error('Error fetching totals data:', err);
        }
        setLoading(false);
    };

    const stats = useMemo(() => {
        if (!totalData) return { rows: [], paymentRows: [], totalServices: 0, totalRevenue: 0, totalProfit: 0 };

        const rows = (totalData.TotalRevenueByTech || []).map((item) => ({
            techId: item.TechName,
            techName: item.TechName,
            serviceCount: item.ServiceCount,
            closedRevenue: item.Total,
            backbar: item.ServiceBackBar,
            commission: item.ServiceCommission,
            profit: item.Profit,
        }));

        const paymentRows = (totalData.TotalRevenueByPaymentType || []).map((item) => ({
            method: item.PaymentType || 'Unknown',
            revenue: item.Total,
            count: item.Count,
        }));

        const totalRevenue = totalData.TotalRevenue || 0;
        const totalServices = totalData.TotalServices || 0;
        const totalProfit = totalData.TotalProfit || 0;

        return { rows, paymentRows, totalRevenue, totalServices, totalProfit };
    }, [totalData]);

    const dateLabel = isSingleDay
        ? new Date(fromDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
        : `${new Date(fromDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(toDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <div style={styles.pageTitle}>Revenue Totals</div>
                    <div style={styles.dateRangeLabel}>{dateLabel}</div>
                </div>
                <div style={styles.datePickerRow}>
                    <DatePicker label="From" value={fromDate} onChange={(val) => {
                        setFromDate(val);
                        if (val > toDate) setToDate(val);
                    }} />
                    <DatePicker label="To" value={toDate} onChange={(val) => {
                        setToDate(val);
                        if (val < fromDate) setFromDate(val);
                    }} />
                </div>
            </div>

            {loading ? (
                <div style={styles.loadingContainer}>
                    <div style={styles.loadingText}>Loading...</div>
                </div>
            ) : (
                <>
                    <div style={styles.statsRow}>
                        <StatCard label="Collected Revenue" value={formatCurrency(totalData?.TotalRevenue || 0)} accent="#10b981" />
                        <StatCard label="Net Profit" value={formatCurrency(totalData?.TotalProfit || 0)} accent="#2563eb" />
                        <StatCard label="Appointments" value={totalData?.TotalAppointments || 0} accent="#8b5cf6" />
                        <StatCard label="Services" value={totalData?.TotalServices || 0} accent="#f59e0b" />
                    </div>

                    <div style={styles.breakdownRow}>

                        {/* Technician breakdown */}
                        <div style={styles.tableCard}>
                            <div style={styles.tableCardHeader}>
                                <span style={styles.tableCardTitle}>Breakdown by Technician</span>
                                <span style={styles.subCount}>{stats.rows.length} technician{stats.rows.length !== 1 ? 's' : ''}</span>
                            </div>

                            {stats.rows.length === 0 ? (
                                <div style={styles.emptyState}>No data for this period.</div>
                            ) : (
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={styles.tableHeaderRow}>
                                            <th style={styles.th}>Technician</th>
                                            <th style={{ ...styles.th, textAlign: 'right' }}>Services</th>
                                            <th style={{ ...styles.th, textAlign: 'right' }}>Collected</th>
                                            <th style={{ ...styles.th, textAlign: 'right' }}>Backbar</th>
                                            <th style={{ ...styles.th, textAlign: 'right' }}>Commission</th>
                                            <th style={{ ...styles.th, textAlign: 'right' }}>Profit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.rows.map((row, i) => (
                                            <tr key={row.techId} style={{
                                                ...styles.tableRow,
                                                backgroundColor: i % 2 === 0 ? '#ffffff' : '#f9fafb',
                                            }}>
                                                <td style={styles.td}>
                                                    <div style={styles.techName}>{row.techName}</div>
                                                </td>
                                                <td style={{ ...styles.td, textAlign: 'right', color: '#374151' }}>{row.serviceCount}</td>
                                                <td style={{ ...styles.td, textAlign: 'right', fontWeight: '600', color: '#111827' }}>
                                                    {formatCurrency(row.closedRevenue)}
                                                </td>
                                                <td style={{ ...styles.td, textAlign: 'right', color: '#ef4444' }}>
                                                    {formatCurrency(row.backbar)}
                                                </td>
                                                <td style={{ ...styles.td, textAlign: 'right', color: '#f59e0b' }}>
                                                    {formatCurrency(row.commission)}
                                                </td>
                                                <td style={{ ...styles.td, textAlign: 'right', fontWeight: '600', color: '#10b981' }}>
                                                    {formatCurrency(row.profit)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr style={styles.totalRow}>
                                            <td style={{ ...styles.td, fontWeight: '700', color: '#111827' }}>Total</td>
                                            <td style={{ ...styles.td, textAlign: 'right', fontWeight: '600' }}>{stats.totalServices}</td>
                                            <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700', color: '#111827' }}>
                                                {formatCurrency(stats.totalRevenue)}
                                            </td>
                                            <td style={{ ...styles.td, textAlign: 'right', fontWeight: '600', color: '#ef4444' }}>
                                                {formatCurrency(stats.rows.reduce((s, r) => s + (r.backbar || 0), 0))}
                                            </td>
                                            <td style={{ ...styles.td, textAlign: 'right', fontWeight: '600', color: '#f59e0b' }}>
                                                {formatCurrency(stats.rows.reduce((s, r) => s + (r.commission || 0), 0))}
                                            </td>
                                            <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700', color: '#10b981' }}>
                                                {formatCurrency(stats.totalProfit)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            )}
                        </div>

                        {/* Payment type breakdown */}
                        <div style={{ ...styles.tableCard, minWidth: '280px', maxWidth: '360px' }}>
                            <div style={styles.tableCardHeader}>
                                <span style={styles.tableCardTitle}>Breakdown by Payment Type</span>
                                <span style={styles.subCount}>{stats.paymentRows.length} type{stats.paymentRows.length !== 1 ? 's' : ''}</span>
                            </div>

                            {stats.paymentRows.length === 0 ? (
                                <div style={styles.emptyState}>No closed appointments.</div>
                            ) : (
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={styles.tableHeaderRow}>
                                            <th style={styles.th}>Type</th>
                                            <th style={{ ...styles.th, textAlign: 'right' }}>Appointments</th>
                                            <th style={{ ...styles.th, textAlign: 'right' }}>Collected</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.paymentRows.map((row, i) => {
                                            const color = PAYMENT_COLORS[i % PAYMENT_COLORS.length];
                                            return (
                                                <tr key={row.method} style={{
                                                    ...styles.tableRow,
                                                    backgroundColor: i % 2 === 0 ? '#ffffff' : '#f9fafb',
                                                }}>
                                                    <td style={styles.td}>
                                                        <div style={styles.paymentMethodCell}>
                                                            <div style={{ ...styles.colorDot, backgroundColor: color }} />
                                                            <span style={styles.techName}>{row.method}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ ...styles.td, textAlign: 'right', color: '#374151' }}>{row.count}</td>
                                                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '600', color: '#111827' }}>
                                                        {formatCurrency(row.revenue)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                    </div>
                </>
            )}
        </div>
    );
}

const styles = {
    container: { padding: '0' },
    header: {
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: '20px', flexWrap: 'wrap', gap: '12px',
    },
    pageTitle: { fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '2px' },
    dateRangeLabel: { fontSize: '13px', color: '#6b7280' },
    datePickerRow: { display: 'flex', alignItems: 'flex-end', gap: '8px' },
    datePickerWrapper: { display: 'flex', flexDirection: 'column', gap: '4px' },
    dateLabel: { fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' },
    dateInput: {
        padding: '6px 10px', fontSize: '13px', color: '#111827',
        border: '1px solid #d1d5db', borderRadius: '6px',
        backgroundColor: '#ffffff', cursor: 'pointer', outline: 'none',
        width: '150px', textAlign: 'center',
    },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' },
    statCard: {
        backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px',
        borderTop: '3px solid #3b82f6', padding: '16px 20px',
    },
    statValue: { fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '2px' },
    statLabel: { fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' },
    breakdownRow: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
    tableCard: {
        flex: 1, backgroundColor: '#ffffff', border: '1px solid #e5e7eb',
        borderRadius: '8px', overflow: 'hidden',
    },
    tableCardHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb',
    },
    tableCardTitle: { fontSize: '14px', fontWeight: '600', color: '#111827' },
    subCount: { fontSize: '12px', color: '#9ca3af' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeaderRow: { backgroundColor: '#f9fafb' },
    th: {
        padding: '10px 16px', fontSize: '11px', fontWeight: '600', color: '#6b7280',
        textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
        borderBottom: '1px solid #e5e7eb',
    },
    tableRow: { transition: 'background-color 0.15s' },
    td: { padding: '12px 16px', fontSize: '13px', color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' },
    techName: { fontWeight: '500', color: '#111827' },
    totalRow: { backgroundColor: '#f9fafb', borderTop: '2px solid #e5e7eb' },
    paymentMethodCell: { display: 'flex', alignItems: 'center', gap: '8px' },
    colorDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
    loadingContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' },
    loadingText: { fontSize: '14px', color: '#6b7280' },
    emptyState: { padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' },
};