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
export default function BookingsPage() {

  const [bookings, setBookings] =
    useState([]);

  const [status, setStatus] =
    useState("");

  async function loadBookings() {

  try {

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

    const data = await res.json();

    console.log(data);

    setBookings(
      Array.isArray(data.bookings)
        ? data.bookings
        : []
    );

  } catch (err) {

    console.error(err);

    setBookings([]);

  }
}

  useEffect(() => {
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
         <tbody>

  {bookings.map((b) => (

    <tr
      key={b.id}
      className="table-row"
    >

      <td className="p-5">
        {b.student_email}
      </td>

      <td className="p-5">
        {b.course_title}
      </td>

      <td className="p-5">

        <span
          className={`
            px-4 py-2 rounded-xl
            ${
              b.status === "confirmed"
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }
          `}
        >
          {b.status}
        </span>

      </td>

      <td className="p-5">

        {new Date(
          b.booked_at
        ).toLocaleString()}

      </td>

    </tr>

  ))}

</tbody>

        </table>
      )}
    </div>
  );
}
