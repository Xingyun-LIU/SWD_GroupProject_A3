// app/admin/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function MiniChart({ data, color }) {
  const max = Math.max(...data, 1);
  return (
    <div className="chart-container" style={{ height: 140, padding: '12px 16px' }}>
      {data.map((val, i) => (
        <div key={i} className="chart-bar-wrap">
          <div
            className={`chart-bar ${color}`}
            style={{ height: `${(val / max) * 100}%` }}
            title={`${DAYS[i]}: ${val}`}
          />
          <span className="chart-bar-label">{DAYS[i]}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ value, label, icon, colorClass, change, changeDir, delay }) {
  return (
    <div className={`stat-card ${colorClass}`} style={{ animationDelay: delay }}>
      <div className="accent-bar" />
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {change && (
        <div className={`stat-change ${changeDir}`}>
          {changeDir === 'up' ? '↑' : '↓'} {change}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);


useEffect(() => {
  const fetchStats = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/bookings?limit=6')
      ]);

      const statsData = await statsRes.json();
      const bookingsData = await bookingsRes.json();

      setStats(statsData);
      setRecentBookings(bookingsData?.bookings || []);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      setRecentBookings([]);
    } finally {
      setLoading(false);
    }
  };

  fetchStats();
}, []);

  if (loading) return (
    <div className="loading-spinner"><div className="spinner" /></div>
  );

  const bookingsChartData = [4, 7, 5, 9, 12, 6, 8]; // mock weekly, replace with real
  const coursesChartData  = [2, 3, 1, 4, 3, 5, 2];

  return (
    <div>
      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          value={stats?.totalCourses ?? '—'}
          label="Total Courses"
          icon="◈"
          colorClass="stat-gold"
          change="8% vs last month"
          changeDir="up"
          delay="0ms"
        />
        <StatCard
          value={stats?.publishedCourses ?? '—'}
          label="Published"
          icon="◉"
          colorClass="stat-emerald"
          change="3 new this week"
          changeDir="up"
          delay="60ms"
        />
        <StatCard
          value={stats?.totalStudents ?? '—'}
          label="Students"
          icon="◎"
          colorClass="stat-sapphire"
          change="12% growth"
          changeDir="up"
          delay="120ms"
        />
        <StatCard
          value={stats?.totalBookings ?? '—'}
          label="Total Bookings"
          icon="⬡"
          colorClass="stat-ruby"
          change="2% drop"
          changeDir="down"
          delay="180ms"
        />
        <StatCard
          value={stats?.upcomingCourses ?? '—'}
          label="Upcoming Courses"
          icon="◫"
          colorClass="stat-gold"
          delay="240ms"
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="glass-panel" style={{ animationDelay: '0.15s' }}>
          <div className="panel-header">
            <span className="panel-title">
              <span className="panel-title-dot" style={{ background: 'var(--sapphire)', boxShadow: '0 0 8px var(--sapphire)' }} />
              Weekly Bookings
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>This week</span>
          </div>
          <MiniChart data={bookingsChartData} color="sapphire" />
        </div>

        <div className="glass-panel" style={{ animationDelay: '0.2s' }}>
          <div className="panel-header">
            <span className="panel-title">
              <span className="panel-title-dot" />
              New Courses
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>This week</span>
          </div>
          <MiniChart data={coursesChartData} color="gold" />
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="glass-panel" style={{ animationDelay: '0.25s' }}>
        <div className="panel-header">
          <span className="panel-title">
            <span className="panel-title-dot" style={{ background: 'var(--emerald)', boxShadow: '0 0 8px var(--emerald)' }} />
            Recent Bookings
          </span>
          <Link href="/admin/bookings" className="btn btn-ghost btn-sm">View All →</Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◉</div>
            <div className="empty-title">No bookings yet</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Course</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map(b => (
                <tr key={b.id}>
                  <td><span className="id-chip">#{b.id}</span></td>
                  <td className="td-primary">{b.student_username}</td>
                  <td>{b.course_title}</td>
                  <td className="td-mono">
                    {b.booked_at ? new Date(b.booked_at).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <span className={`badge badge-${b.status}`}>{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 24 }}>
        {[
          { href: '/admin/courses/new', label: 'Create New Course', icon: '✦', desc: 'Add a new course to the catalog' },
          { href: '/admin/users',       label: 'Manage Users',      icon: '◎', desc: 'View and manage student accounts' },
          { href: '/admin/backup',      label: 'System Backup',     icon: '◫', desc: 'Backup database and files' },
        ].map(q => (
          <Link
            key={q.href}
            href={q.href}
            style={{ textDecoration: 'none' }}
          >
            <div className="glass-panel" style={{ padding: 20, cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: 8, color: 'var(--gold)' }}>{q.icon}</div>
              <div style={{ fontSize: '0.87rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{q.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{q.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}