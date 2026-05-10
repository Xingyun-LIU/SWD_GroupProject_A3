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
        if (status) params.set('status', status);

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
        console.error(error);
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
      <div style={{ marginBottom: 24 }}>
        <p className="home-kicker">Admin Area</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', lineHeight: 1.1 }}>
          Booking Management
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
          Review student bookings and filter by status.
        </p>
      </div>

      <div className="glass-panel" style={{ marginBottom: 16 }}>
        <div className="toolbar">
          <div className="search-bar" style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Search student, email, or course..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="form-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            style={{ width: 180 }}
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <div className="toolbar-right">
            <span className="page-info">
              Showing {filteredBookings.length} of {bookings.length}
            </span>
          </div>
        </div>
      </div>

      <div className="glass-panel">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-title">No bookings found</div>
            <div className="empty-desc">Try changing filters or search terms.</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Email</th>
                <th>Course</th>
                <th>Course Time</th>
                <th>Status</th>
                <th>Booked</th>
                <th>Cancelled</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="td-mono">
                    <span className="id-chip">{booking.id}</span>
                  </td>
                  <td className="td-primary">{booking.student_username || '-'}</td>
                  <td>{booking.student_email || '-'}</td>
                  <td>{booking.course_title || '-'}</td>
                  <td className="td-mono">
                    {booking.course_start_time
                      ? new Date(booking.course_start_time).toLocaleString()
                      : '-'}
                  </td>
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
                  <td className="td-mono">
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
    </div>
  );
}
