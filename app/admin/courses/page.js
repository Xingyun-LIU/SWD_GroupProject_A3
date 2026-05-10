'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  //state for filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');

  //loadCourses
  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      
      //build query params based on filters
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (status) params.append('status', status);
      if (date) params.append('date', date);

      const res = await fetch(`/api/admin/courses?${params.toString()}`);

      if (!res.ok) {
        setCourses([]);
        return;
      }

      const data = await res.json();
      // if API returns { courses: [...] } or just [...]
      setCourses(data.courses || data || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  }, [search, category, status, date]); //will change when any filter changes

  useEffect(() => {
    // debounce loading to avoid too many requests when typing/changing filters
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

    //refresh list after deletion
    loadCourses();
  }

  return (
    <div className="page-content">
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-title-dot" />
          Course Management (Admin)
        </div>
      </div>

      {/* FILTERS */}
      <div className="glass-panel" style={{ marginBottom: 16 }}>
        <div className="toolbar" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Search */}
          <div className="search-bar" style={{ flex: 1 }}>
            <span className="search-icon">🔎</span>
            <input
              type="text"
              placeholder="Search title, instructor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Filter  */}
          <input 
            type="text"
            className="form-select"
            placeholder="Category..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: '150px' }}
          />

          {/* Date Filter */}
          <input 
            type="date"
            className="form-select"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {/* Status Filter */}
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

          <Link className="btn btn-primary" href="/admin/courses/new">
            + New Course
          </Link>
        </div>
      </div>

      <div className="glass-panel">
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <div className="empty-title">No courses found</div>
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
              {courses.map((c) => (
                <tr key={c.id}>
                  <td className="td-mono"><span className="id-chip">{c.id}</span></td>
                  <td className="td-primary">{c.title}</td>
                  <td>{c.category || '-'}</td>
                  <td>{c.instructor}</td>
                  <td className="td-mono">
                    {c.start_time ? new Date(c.start_time).toLocaleString() : '-'}
                  </td>
                  <td>{c.capacity}</td>
                  <td>
                    <span className={`badge badge-${c.status}`}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <Link className="btn btn-ghost btn-sm" href={`/admin/courses/${c.id}/edit`}>
                      Edit
                    </Link>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteCourse(c.id)} style={{ marginLeft: 8 }}>
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
