'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (status) params.append('status', status);
      if (date) params.append('date', date);

      const query = params.toString();
      const res = await fetch(query ? `/api/admin/courses?${query}` : '/api/admin/courses');

      if (!res.ok) {
        setCourses([]);
        return;
      }

      const data = await res.json();
      setCourses(data.courses || data || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, status, date]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadCourses();
    }, 300);

    return () => clearTimeout(handler);
  }, [loadCourses]);

  async function deleteCourse(id) {
    const ok = confirm('Delete this course?');
    if (!ok) return;

    const res = await fetch(`/api/admin/courses/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      alert('Failed to delete course');
      return;
    }

    loadCourses();
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p className="home-kicker">Admin Area</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', lineHeight: 1.1 }}>
          Course Management
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
          Create, filter, edit, and remove course records.
        </p>
      </div>

      <div className="glass-panel" style={{ marginBottom: 16 }}>
        <div className="toolbar">
          <div className="search-bar" style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Search title or instructor..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <input
            type="text"
            className="form-input"
            placeholder="Category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            style={{ width: 150 }}
          />

          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            style={{ width: 170 }}
          />

          <select
            className="form-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            style={{ width: 160 }}
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <div className="toolbar-right">
            <span className="page-info">Showing {courses.length} courses</span>
            <Link className="btn btn-primary" href="/admin/courses/new">
              New Course
            </Link>
          </div>
        </div>
      </div>

      <div className="glass-panel">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-title">No courses found</div>
            <div className="empty-desc">Create a new course or adjust the filters.</div>
            <Link className="btn btn-primary" href="/admin/courses/new">
              New Course
            </Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Instructor</th>
                <th>Start Time</th>
                <th>Capacity</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td className="td-mono">
                    <span className="id-chip">{course.id}</span>
                  </td>
                  <td className="td-primary">{course.title}</td>
                  <td>{course.category || '-'}</td>
                  <td>{course.instructor}</td>
                  <td className="td-mono">
                    {course.start_time ? new Date(course.start_time).toLocaleString() : '-'}
                  </td>
                  <td>{course.capacity}</td>
                  <td>
                    <span className={`badge badge-${course.status}`}>
                      {course.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <Link className="btn btn-ghost btn-sm" href={`/admin/courses/${course.id}/edit`}>
                      Edit
                    </Link>
                    <button
                      className="btn btn-danger btn-sm"
                      type="button"
                      onClick={() => deleteCourse(course.id)}
                      style={{ marginLeft: 8 }}
                    >
                      Delete
                    </button>
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
