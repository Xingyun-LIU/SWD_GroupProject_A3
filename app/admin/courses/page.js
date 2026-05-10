'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function loadCourses() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/courses');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Load courses error:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteCourse(id) {
    if (!confirm('Delete this course?')) return;
    await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
    loadCourses();
  }

  useEffect(() => {
    loadCourses();
    // 每 30 秒自动刷新，保持 status 实时
    const interval = setInterval(loadCourses, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = courses.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor?.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = {
    published: 'badge-published',
    draft: 'badge-draft',
    cancelled: 'badge-cancelled',
  };

  return (
    <div>
      <div className="glass-panel">
        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-bar">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              placeholder="Search courses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="toolbar-right">
            <button className="btn btn-ghost btn-sm" onClick={loadCourses}>
              ↻ Refresh
            </button>
            <Link href="/admin/courses-new" className="btn btn-primary btn-sm">
              + New Course
            </Link>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◉</div>
            <div className="empty-title">No courses found</div>
            <div className="empty-desc">Add a new course or adjust your search.</div>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Instructor</th>
                  <th>Capacity</th>
                  <th>Enrolled</th>
                  <th>Remaining</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td><span className="id-chip">#{c.id}</span></td>
                    <td className="td-primary">{c.title}</td>
                    <td>{c.category || '—'}</td>
                    <td>{c.instructor}</td>
                    <td className="td-mono">{c.capacity}</td>
                    <td className="td-mono">{c.enrolled_count}</td>
                    <td className="td-mono">
                      <span style={{ color: c.remaining_places === 0 ? 'var(--ruby)' : 'var(--emerald)' }}>
                        {c.remaining_places}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${statusColor[c.status] || 'badge-draft'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link href={`/admin/course-id-edit?id=${c.id}`} className="btn btn-ghost btn-sm">
                          Edit
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteCourse(c.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="page-info" style={{ padding: '12px 24px', borderTop: '1px solid var(--border)' }}>
              Showing {filtered.length} of {courses.length} courses
            </div>
          </>
        )}
      </div>
    </div>
  );
}