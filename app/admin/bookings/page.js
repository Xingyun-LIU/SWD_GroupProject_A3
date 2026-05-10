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
      } catch (e) {
        console.error(e);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, [status]);

  const filteredBookings = bookings.filter((b) => {
    const k = search.toLowerCase();

    return (
      b.student_username?.toLowerCase().includes(k) ||
      b.student_email?.toLowerCase().includes(k) ||
      b.course_title?.toLowerCase().includes(k)
    );
  });

  return (
    <div className="page-content">

      {/* HEADER */}
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-title-dot" />
          Booking Management
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="glass-panel" style={{ marginBottom: 16 }}>
        <div className="toolbar">

          {/* search */}
          <div className="search-bar">
            <span className="search-icon">🔎</span>
            <input
              type="text"
              placeholder="Search student, email or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* status filter */}
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>

        </div>
      </div>

      {/* TABLE */}
      <div className="glass-panel">

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <div className="empty-title">No bookings found</div>
            <div className="empty-desc">
              Try changing filters or search terms
            </div>
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
              {filteredBookings.map((b) => (
                <tr key={b.id}>

                  <td className="td-mono">
                    <span className="id-chip">{b.id}</span>
                  </td>

                  <td className="td-primary">
                    {b.student_username || '-'}
                  </td>

                  <td>{b.student_email || '-'}</td>

                  <td>{b.course_title || '-'}</td>

                  <td className="td-mono">
                    {b.course_start_time
  ? new Date(b.course_start_time).toLocaleString()
  : '-'}
                  </td>

                  <td>
                    <span className={`badge badge-${b.status}`}>
                      {b.status}
                    </span>
                  </td>

                  <td className="td-mono">
                    {b.booked_at
                      ? new Date(b.booked_at).toLocaleString()
                      : '-'}
                  </td>

                  <td className="td-mono">
                    {b.cancelled_at
                      ? new Date(b.cancelled_at).toLocaleString()
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
