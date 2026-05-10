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

    if (loading) return <p>Loading bookings...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <button type="button" onClick={() => router.push('/student/dashboard')}>
                Back
            </button>

            <h1>My Bookings</h1>

            <div>
                <button type="button" onClick={() => setFilter('upcoming')}>
                    Upcoming
                </button>

                <button type="button" onClick={() => setFilter('past')}>
                    Past
                </button>

                <button type="button" onClick={() => setFilter('cancelled')}>
                    Cancelled
                </button>

                <button type="button" onClick={() => setFilter('all')}>
                    All
                </button>
            </div>

            {filteredBookings.length === 0 ? (
                <p>No bookings found.</p>
            ) : (
                <table>
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
                                        onClick={() =>
                                            router.push(`/courses/${booking.course_id}`)
                                        }
                                        style={{ cursor: 'pointer', color: 'blue' }}
                                    >
                                        {booking.course_title}
                                    </td>

                                    <td>{booking.instructor}</td>
                                    <td>{booking.category || 'Uncategorized'}</td>

                                    <td>
                                        {booking.start_time
                                            ? new Date(booking.start_time).toLocaleString()
                                            : '-'}
                                    </td>

                                    <td>{booking.location || '-'}</td>
                                    <td>{booking.status}</td>

                                    <td>
                                        {booking.booked_at
                                            ? new Date(booking.booked_at).toLocaleString()
                                            : '-'}
                                    </td>

                                    <td>
                                        {canCancel ? (
                                            <button
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
    );
}
