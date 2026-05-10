'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCoursePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    instructor: '',
    start_time: '',
    end_time: '',
    location: '',
    capacity: 1,
    status: 'draft',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? Number(value) : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create course.');
        return;
      }

      router.push('/admin/courses');
    } catch (e) {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-content">

      {/* HEADER */}
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-title-dot" />
          Create New Course
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="glass-panel" style={{ marginBottom: 16 }}>
          <div className="danger-zone">
            <div>
              <div className="danger-title">Error</div>
              <div className="danger-text">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* FORM CARD */}
      <div className="glass-panel">

        <form onSubmit={handleSubmit} className="form-grid">

          {/* Title */}
          <div className="form-group full">
            <label className="form-label">Title</label>
            <input
              className="form-input"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Course title..."
            />
          </div>

          {/* Description */}
          <div className="form-group full">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the course..."
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <input
              className="form-input"
              name="category"
              value={form.category}
              onChange={handleChange}
            />
          </div>

          {/* Instructor */}
          <div className="form-group">
            <label className="form-label">Instructor</label>
            <input
              className="form-input"
              name="instructor"
              value={form.instructor}
              onChange={handleChange}
              required
            />
          </div>

          {/* Start */}
          <div className="form-group">
            <label className="form-label">Start Time</label>
            <input
              className="form-input"
              type="datetime-local"
              name="start_time"
              value={form.start_time}
              onChange={handleChange}
              required
            />
          </div>

          {/* End */}
          <div className="form-group">
            <label className="form-label">End Time</label>
            <input
              className="form-input"
              type="datetime-local"
              name="end_time"
              value={form.end_time}
              onChange={handleChange}
              required
            />
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              className="form-input"
              name="location"
              value={form.location}
              onChange={handleChange}
            />
          </div>

          {/* Capacity */}
          <div className="form-group">
            <label className="form-label">Capacity</label>
            <input
              className="form-input"
              type="number"
              min="1"
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
            />
          </div>

          {/* Status */}
          <div className="form-group full">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* ACTION BAR */}
          <div className="toolbar" style={{ gridColumn: '1 / -1' }}>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => router.push('/admin/courses')}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}
