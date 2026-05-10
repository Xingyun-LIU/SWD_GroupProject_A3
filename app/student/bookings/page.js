// Displays all current student bookings. 
// Distinguish between upcoming, past, and cancelled bookings. 
// Click the course name to view course details. 
// Click the cancel button to cancel the booking.

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentBookingsPage() {
    const router = useRouter();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('upcoming');
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadBookings() {
            try {
                const res = await fetch('/api/student/bookings');
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || 'Failed to load bookings.');
                    return;
                }

                setBookings(data.bookings || []);
            } catch {
                setError('Failed to load bookings.');
            } finally {
                setLoading(false);
            }
        }

        loadBookings();
    }, []);

    async function cancelBooking(bookingId) {
        if (!confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
                method: 'PUT',
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Failed to cancel booking.');
                return;
            }

            setBookings((currentBookings) =>
                currentBookings.map((booking) =>
                    booking.id === bookingId
                        ? {
                            ...booking,
                            status: 'cancelled',
                            cancelled_at: new Date().toISOString(),
                        }
                        : booking
                )
            );
        } catch {
            alert('Network error. Please try again.');
        }
    }

    // Filter bookings with its date and status
    const filteredBookings = bookings.filter((booking) => {
        const now = new Date();
        const startTime = new Date(booking.start_time);

        if (filter === 'upcoming') {
            return booking.status === 'confirmed' && startTime >= now;
        }

        if (filter === 'past') {
            return startTime < now;
        }

        if (filter === 'cancelled') {
            return booking.status === 'cancelled';
        }

        return true;
    });

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="empty-state">
                <div className="empty-title">Unable to load bookings</div>
                <div className="empty-desc">{error}</div>
            </div>
        );
    }

    return (
        <div>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => router.push('/student/dashboard')}>
                Back
            </button>

            <div style={{ margin: '18px 0 24px' }}>
                <p className="home-kicker">Student Area</p>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', lineHeight: 1.1 }}>
                    My Bookings
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
                    Review upcoming, past, and cancelled course bookings.
                </p>
            </div>

            <div className="glass-panel">
                <div className="toolbar">
                <button
                    className={`btn btn-sm ${filter === 'upcoming' ? 'btn-primary' : 'btn-ghost'}`}
                    type="button"
                    onClick={() => setFilter('upcoming')}
                >
                    Upcoming
                </button>

                <button
                    className={`btn btn-sm ${filter === 'past' ? 'btn-primary' : 'btn-ghost'}`}
                    type="button"
                    onClick={() => setFilter('past')}
                >
                    Past
                </button>

                <button
                    className={`btn btn-sm ${filter === 'cancelled' ? 'btn-primary' : 'btn-ghost'}`}
                    type="button"
                    onClick={() => setFilter('cancelled')}
                >
                    Cancelled
                </button>

                <button
                    className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                    type="button"
                    onClick={() => setFilter('all')}
                >
                    All
                </button>

                    <div className="toolbar-right">
                        <span className="page-info">
                            Showing {filteredBookings.length} of {bookings.length}
                        </span>
                    </div>
                </div>

            {filteredBookings.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-title">No bookings found</div>
                    <div className="empty-desc">Try a different filter or browse courses to create a new booking.</div>
                    <button className="btn btn-primary" type="button" onClick={() => router.push('/courses')}>
                        Browse Courses
                    </button>
                </div>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Course</th>
                            <th>Instructor</th>
                            <th>Category</th>
                            <th>Time</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Booked At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredBookings.map((booking) => {
                            const hoursUntilStart =
                                (new Date(booking.start_time) - new Date()) /
                                (1000 * 60 * 60);

                            const canCancel =
                                booking.status === 'confirmed' &&
                                hoursUntilStart >= 24;

                            return (
                                <tr key={booking.id}>
                                    <td
                                        className="td-primary"
                                        onClick={() =>
                                            router.push(`/courses/${booking.course_id}`)
                                        }
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {booking.course_title}
                                    </td>

                                    <td>{booking.instructor}</td>
                                    <td>{booking.category || 'Uncategorized'}</td>

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

                                    <td className="td-mono">
                                        {booking.booked_at
                                            ? new Date(booking.booked_at).toLocaleString()
                                            : '-'}
                                    </td>

                                    <td>
                                        {canCancel ? (
                                            <button
                                                className="btn btn-danger btn-sm"
                                                type="button"
                                                onClick={() => cancelBooking(booking.id)}
                                            >
                                                Cancel
                                            </button>
                                        ) : (
                                            <span>-</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
            </div>
        </div>
    );
}
