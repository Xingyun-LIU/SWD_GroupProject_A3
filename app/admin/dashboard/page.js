'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    totalBookings: 0,
    totalStudents: 0,
    upcomingCourses: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/bookings?limit=5'),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.stats || data);
        }

        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          setRecentBookings(data.bookings || []);
        }
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
        <p className="home-kicker">Admin Area</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', lineHeight: 1.1 }}>
          Admin Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
          Monitor courses, bookings, users, and upcoming teaching activity.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-gold">
          <div className="accent-bar" />
          <div className="stat-value">{stats.totalCourses}</div>
          <div className="stat-label">Total Courses</div>
        </div>

        <div className="stat-card stat-sapphire">
          <div className="accent-bar" />
          <div className="stat-value">{stats.publishedCourses}</div>
          <div className="stat-label">Published Courses</div>
        </div>

        <div className="stat-card stat-emerald">
          <div className="accent-bar" />
          <div className="stat-value">{stats.totalBookings}</div>
          <div className="stat-label">Total Bookings</div>
        </div>

        <div className="stat-card stat-ruby">
          <div className="accent-bar" />
          <div className="stat-value">{stats.totalStudents}</div>
          <div className="stat-label">Students</div>
        </div>

        <div className="stat-card stat-gold">
          <div className="accent-bar" />
          <div className="stat-value">{stats.upcomingCourses}</div>
          <div className="stat-label">Upcoming Courses</div>
        </div>
      </div>

      <div className="glass-panel" style={{ marginBottom: 24 }}>
        <div className="panel-header">
          <div className="panel-title">
            <span className="panel-title-dot" />
            Quick Actions
          </div>
        </div>

        <div className="toolbar">
          <Link className="btn btn-primary" href="/admin/courses">
            Manage Courses
          </Link>
          <Link className="btn btn-ghost" href="/admin/courses/new">
            Create Course
          </Link>
          <Link className="btn btn-ghost" href="/admin/bookings">
            View Bookings
          </Link>
          <Link className="btn btn-ghost" href="/admin/users">
            Manage Users
          </Link>
        </div>
      </div>

      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title">
            <span className="panel-title-dot" />
            Recent Bookings
          </div>
          <Link className="btn btn-ghost btn-sm" href="/admin/bookings">
            View All
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-title">No recent bookings</div>
            <div className="empty-desc">
              Bookings will appear here once users start enrolling.
            </div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Course</th>
                <th>Status</th>
                <th>Booked</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="td-mono">{booking.id}</td>
                  <td className="td-primary">
                    {booking.student_username || booking.student_email}
                  </td>
                  <td>{booking.course_title}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
