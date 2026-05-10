// Get the current student's own courses reservation 
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
        return <p>Loading dashboard...</p>;
    }

    return (
        <div>
            <h1>Student Dashboard</h1>

            <section>
                <h2>Welcome</h2>
                <p>
                    Hi, {user?.username || 'Student'}.
                </p>
            </section>

            <section>
                <h2>Quick Actions</h2>

                <div>
                    <Link href="/courses">Browse Courses</Link>
                    <Link href="/student/bookings">My Bookings</Link>
                    <Link href="/student/profile">Profile</Link>
                </div>
            </section>

            <section>
                <h2>Upcoming Bookings</h2>

                {bookings.length === 0 ? (
                    <p>You have no upcoming bookings.</p>
                ) : (
                    <table>
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
                                    <td>{booking.course_title}</td>
                                    <td>
                                        {booking.start_time
                                            ? new Date(booking.start_time).toLocaleString()
                                            : '-'}
                                    </td>
                                    <td>{booking.location || '-'}</td>
                                    <td>{booking.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <p>
                    <Link href="/student/bookings">View all bookings</Link>
                </p>
            </section>
        </div>
    );
}
