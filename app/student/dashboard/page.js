'use client';
 
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
 
export default function StudentDashboard() {
    const router = useRouter();
 
    //Current logged-in user
    const [user, setUser] = useState(null);
    //Recent booking list
    const [bookings, setBookings] = useState([]);
    //Loading state
    const [loading, setLoading] = useState(true);
 
    useEffect(() => {
        fetchUser();
        fetchBookings();
    }, []);
 
    //Fetch current logged-in user information
    async function fetchUser() {
        try {
            const res = await fetch('/api/auth/this');
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            }
        } catch (err) {
            console.error(err);
        }
    }
 
    //Fetch recent booking list
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
 
    //Cancel booking
    async function cancelBooking(bookingId) {
        if (!confirm('Are you absolutely sure you want to cancel this appointment?？')) return;
 
        try {
            const res = await fetch(`/api/bookings/${bookingId}`, {
                method: 'DELETE',
            });
 
            if (res.ok) {
                // Refresh the booking list after successful cancellation
                fetchBookings();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to cancel booking');
            }
        } catch (err) {
            alert('Network error, please try again');
        }
    }
 
    if (loading) return <div>Loading...</div>;
 
    return (
        <div>
            <h1>Student Dashboard</h1>
 
            {/* Welcome message */}
            {user && <p>Welcome, {user.username}</p>}
 
            {/* Quick access buttons */}
            <button onClick={() => router.push('/courses')}>Browse Courses</button>
            <button onClick={() => router.push('/student/bookings')}>My Bookings</button>
            <button onClick={() => router.push('/student/profile')}>Profile</button>
 
            {/* Recent bookings */}
            <h2>Recent Bookings</h2>
            {bookings.length === 0 ? (
                <p>No bookings found, <span onClick={() => router.push('/courses')} style={{ cursor: 'pointer', color: 'blue' }}>browse courses</span></p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Course Name</th>
                            <th>Instructor</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking.id}>
                                <td>{booking.course_title}</td>
                                <td>{booking.instructor}</td>
                                <td>{booking.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}</td>
                                <td>
                                    {/* Only confirmed bookings can be cancelled */}
                                    {booking.status === 'confirmed' && (
                                        <button onClick={() => cancelBooking(booking.id)}>
                                            Cancel Booking
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
 