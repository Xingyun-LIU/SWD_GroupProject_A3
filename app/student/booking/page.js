'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentBookingsPage() {
    const router = useRouter();

    //Appointment list
    const [bookings, setBookings] = useState([]);
    //Loading state
    const [loading, setLoading] = useState(true);
    //Filter state: all / confirmed / cancelled
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchBookings();
    }, []);

    //Fetch appointment list from the backend
    async function fetchBookings() {
        try {
            const res = await fetch('/api/bookings');
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    //Cancel appointment
    async function cancelBooking(bookingId) {
        if (!confirm('Are you absolutely sure you want to cancel this appointment?')) return;

        try {
            const res = await fetch(`/api/bookings/${bookingId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchBookings();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to cancel appointment');
            }
        } catch (err) {
            alert('Network error, please try again');
        }
    }

    //Filter appointments based on status
    const filteredBookings = bookings.filter((b) => {
        if (filter === 'all') return true;
        return b.status === filter;
    });

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <button onClick={() => router.push('/student/dashboard')}>← 返回</button>

            <h1>My Appointments</h1>

            {/* Filter buttons */}
            <div>
                <button onClick={() => setFilter('all')}>All</button>
                <button onClick={() => setFilter('confirmed')}>Confirmed</button>
                <button onClick={() => setFilter('cancelled')}>Cancelled</button>
            </div>

            {/* Appointment list */}
            {filteredBookings.length === 0 ? (
                <p>No appointments found.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Course Name</th>
                            <th>Instructor</th>
                            <th>Category</th>
                            <th>Booking Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.map((booking) => (
                            <tr key={booking.id}>
                                <td
                                    onClick={() => router.push(`/courses/${booking.course_id}`)}
                                    style={{ cursor: 'pointer', color: 'blue' }}
                                >
                                    {booking.course_title}
                                </td>
                                <td>{booking.instructor}</td>
                                <td>{booking.category || 'Uncategorized'}</td>
                                <td>{booking.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}</td>
                                <td>
                                    {booking.status === 'confirmed' && (
                                        <button onClick={() => cancelBooking(booking.id)}>
                                            Cancel Appointment
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}