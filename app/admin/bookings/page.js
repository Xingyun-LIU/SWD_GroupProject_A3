'use client';

import { useEffect, useState } from 'react';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);

        const params = new URLSearchParams();

        if (status) {
          params.set('status', status);
        }

        const url = params.toString()
          ? `/api/admin/bookings?${params.toString()}`
          : '/api/admin/bookings';

        const res = await fetch(url);

        if (!res.ok) {
          setBookings([]);
          return;
        }

        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (error) {
        console.error('Load admin bookings error:', error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, [status]);

  const filteredBookings = bookings.filter((booking) => {
    const keyword = search.toLowerCase();

    return (
      booking.student_username?.toLowerCase().includes(keyword) ||
      booking.student_email?.toLowerCase().includes(keyword) ||
      booking.course_title?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div>
      <h1>Booking Management</h1>

      <div>
        <input
          type="text"
          placeholder="Search by student or course"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <p>Loading bookings...</p>
      ) : filteredBookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Email</th>
              <th>Course</th>
              <th>Course Time</th>
              <th>Status</th>
              <th>Booked At</th>
              <th>Cancelled At</th>
            </tr>
          </thead>

          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.student_username}</td>
                <td>{booking.student_email}</td>
                <td>{booking.course_title}</td>
                <td>
                  {booking.start_time
                    ? new Date(booking.start_time).toLocaleString()
                    : '-'}
                </td>
                <td>{booking.status}</td>
                <td>
                  {booking.booked_at
                    ? new Date(booking.booked_at).toLocaleString()
                    : '-'}
                </td>
                <td>
                  {booking.cancelled_at
                    ? new Date(booking.cancelled_at).toLocaleString()
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
