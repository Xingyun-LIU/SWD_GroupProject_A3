'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);

        const res = await fetch('/api/admin/courses');

        if (!res.ok) {
          setCourses([]);
          return;
        }

        const data = await res.json();
        setCourses(data.courses || []);
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

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

    setCourses((prev) => prev.filter((c) => c.id !== id));
  }

  const filteredCourses = courses.filter((c) => {
    const k = search.toLowerCase();

    const matchSearch =
      c.title?.toLowerCase().includes(k) ||
      c.instructor?.toLowerCase().includes(k) ||
      c.category?.toLowerCase().includes(k);

    const matchStatus = status ? c.status === status : true;

    return matchSearch && matchStatus;
  });

  return (
    <div className="page-content">

      {/* HEADER */}
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-title-dot" />
          Course Management
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
              placeholder="Search title, instructor, category..."
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
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* action */}
          <Link className="btn btn-primary" href="/admin/courses/new">
            + New Course
          </Link>

        </div>
      </div>

      {/* TABLE */}
      <div className="glass-panel">

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <div className="empty-title">No courses found</div>
            <div className="empty-desc">
              Try changing filters or create a new course
            </div>
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
                <th>Enrolled</th>
                <th>Remaining</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCourses.map((c) => (
                <tr key={c.id}>

                  <td className="td-mono">
                    <span className="id-chip">{c.id}</span>
                  </td>

                  <td className="td-primary">
                    {c.title}
                  </td>

                  <td>{c.category || '-'}</td>

                  <td>{c.instructor}</td>

                  <td className="td-mono">
                    {c.start_time
                      ? new Date(c.start_time).toLocaleString()
                      : '-'}
                  </td>

                  <td>{c.capacity}</td>

                  <td>{c.enrolled_count}</td>

                  <td>{c.remaining_places}</td>

                  <td>
                    <span className={`badge badge-${c.status}`}>
                      {c.status}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>

                    <Link
                      className="btn btn-ghost btn-sm"
                      href={`/admin/courses/${c.id}/edit`}
                    >
                      Edit
                    </Link>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteCourse(c.id)}
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
