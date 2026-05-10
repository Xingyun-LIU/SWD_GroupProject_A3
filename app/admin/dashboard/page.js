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
          const statsData = await statsRes.json();
          setStats(statsData.stats || statsData);
        }

        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setRecentBookings(bookingsData.bookings || []);
        }
      } catch (error) {
        console.error('Load admin dashboard error:', error);
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
      <h1>Admin Dashboard</h1>

      <section>
        <h2>Overview</h2>

        <div>
          <div>
            <strong>{stats.totalCourses}</strong>
            <p>Total Courses</p>
          </div>

          <div>
            <strong>{stats.publishedCourses}</strong>
            <p>Published Courses</p>
          </div>

          <div>
            <strong>{stats.totalBookings}</strong>
            <p>Total Bookings</p>
          </div>

          <div>
            <strong>{stats.totalStudents}</strong>
            <p>Total Students</p>
          </div>

          <div>
            <strong>{stats.upcomingCourses}</strong>
            <p>Upcoming Courses</p>
          </div>
        </div>
      </section>

      <section>
        <h2>Quick Actions</h2>

        <div>
          <Link href="/admin/courses">Manage Courses</Link>
          <Link href="/admin/courses/new">Create New Course</Link>
          <Link href="/admin/bookings">View Bookings</Link>
          <Link href="/admin/users">Manage Users</Link>
        </div>
      </section>

      <section>
        <h2>Recent Bookings</h2>

        {recentBookings.length === 0 ? (
          <p>No recent bookings.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Course</th>
                <th>Status</th>
                <th>Booked At</th>
              </tr>
            </thead>

            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.student_username || booking.student_email}</td>
                  <td>{booking.course_title}</td>
                  <td>{booking.status}</td>
                  <td>
                    {booking.booked_at
                      ? new Date(booking.booked_at).toLocaleString()
                      : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p>
          <Link href="/admin/bookings">View all bookings</Link>
        </p>
      </section>
    </div>
  );
}
