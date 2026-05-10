// Show the current student's upcoming course reservations.
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function StudentDashboardPage() {
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDashboard() {
            try {
                const userRes = await fetch('/api/auth/this');

                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser(userData);
                }

                const bookingsRes = await fetch('/api/student/bookings?type=upcoming');

                if (bookingsRes.ok) {
                    const bookingsData = await bookingsRes.json();
                    setBookings(bookingsData.bookings || []);
                }
            } catch (error) {
                console.error('Load student dashboard error:', error);
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <p className="home-kicker">Student Area</p>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', lineHeight: 1.1 }}>
                    Student Dashboard
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
                    Welcome back, {user?.username || 'Student'}. Manage your courses and bookings from here.
                </p>
            </div>

            <section className="stats-grid">
                <div className="stat-card stat-sapphire">
                    <div className="accent-bar" />
                    <div className="stat-value">{bookings.length}</div>
                    <div className="stat-label">Upcoming Bookings</div>
                </div>

                <div className="stat-card stat-gold">
                    <div className="accent-bar" />
                    <div className="stat-value">{user?.role === 'student' ? 'Student' : '-'}</div>
                    <div className="stat-label">Current Role</div>
                </div>

                <div className="stat-card stat-emerald">
                    <div className="accent-bar" />
                    <div className="stat-value">Active</div>
                    <div className="stat-label">Account Status</div>
                </div>
            </section>

            <section className="home-grid">
                <Link href="/courses" className="glass-panel home-card" style={{ textDecoration: 'none' }}>
                    <h2>Browse Courses</h2>
                    <p>Search available sessions and book a place.</p>
                </Link>

                <Link href="/student/bookings" className="glass-panel home-card" style={{ textDecoration: 'none' }}>
                    <h2>My Bookings</h2>
                    <p>View upcoming, past, and cancelled bookings.</p>
                </Link>

                <Link href="/student/profile" className="glass-panel home-card" style={{ textDecoration: 'none' }}>
                    <h2>Profile</h2>
                    <p>Update your password and manage account access.</p>
                </Link>
            </section>

            <section className="glass-panel">
                <div className="panel-header">
                    <span className="panel-title">
                        <span className="panel-title-dot" />
                        Upcoming Bookings
                    </span>
                    <Link href="/student/bookings" className="btn btn-ghost btn-sm">
                        View All
                    </Link>
                </div>

                {bookings.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-title">No upcoming bookings</div>
                        <div className="empty-desc">Browse courses to reserve your next session.</div>
                        <Link href="/courses" className="btn btn-primary">
                            Browse Courses
                        </Link>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Course</th>
                                <th>Time</th>
                                <th>Location</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {bookings.slice(0, 5).map((booking) => (
                                <tr key={booking.id}>
                                    <td className="td-primary">{booking.course_title}</td>
                                    <td className="td-mono">
                                        {booking.start_time
                                            ? new Date(booking.start_time).toLocaleString()
                                            : '-'}
                                    </td>
                                    <td>{booking.location || '-'}</td>
                                    <td>
                                        <span className={`badge badge-${booking.status}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
}
