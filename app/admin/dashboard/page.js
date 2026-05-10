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
    <div className="page-content">

      {/* HEADER */}
      <div className="panel-header" style={{ marginBottom: 20 }}>
        <div className="panel-title">
          <span className="panel-title-dot" />
          Admin Dashboard
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid">

        <div className="stat-card stat-gold">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{stats.totalCourses}</div>
          <div className="stat-label">Total Courses</div>
        </div>

        <div className="stat-card stat-sapphire">
          <div className="stat-icon">🚀</div>
          <div className="stat-value">{stats.publishedCourses}</div>
          <div className="stat-label">Published Courses</div>
        </div>

        <div className="stat-card stat-emerald">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{stats.totalBookings}</div>
          <div className="stat-label">Total Bookings</div>
        </div>

        <div className="stat-card stat-ruby">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.totalStudents}</div>
          <div className="stat-label">Students</div>
        </div>

        <div className="stat-card stat-gold">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{stats.upcomingCourses}</div>
          <div className="stat-label">Upcoming</div>
        </div>

      </div>

      {/* ACTIONS PANEL */}
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

      {/* TABLE */}
      <div className="glass-panel">

        <div className="panel-header">
          <div className="panel-title">
            <span className="panel-title-dot" />
            Recent Bookings
          </div>
        </div>

        {recentBookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
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
              {recentBookings.map((b) => (
                <tr key={b.id}>
                  <td className="td-mono">{b.id}</td>
                  <td className="td-primary">
                    {b.student_username || b.student_email}
                  </td>
                  <td>{b.course_title}</td>
                  <td>
                    <span className={`badge badge-${b.status}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="td-mono">
                    {b.booked_at
                      ? new Date(b.booked_at).toLocaleString()
                      : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="toolbar">
          <Link className="btn btn-ghost btn-sm" href="/admin/bookings">
            View all bookings →
          </Link>
        </div>
      </div>

    </div>
  );
}