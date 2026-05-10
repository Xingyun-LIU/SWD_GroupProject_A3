'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

function formatDateTimeLocal(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (n) => String(n).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCourse() {
      try {
        const res = await fetch(`/api/admin/courses/${id}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to load course.');
          return;
        }

        const c = data.course || data;

        setForm({
          title: c.title || '',
          description: c.description || '',
          category: c.category || '',
          instructor: c.instructor || '',
          start_time: formatDateTimeLocal(c.start_time),
          end_time: formatDateTimeLocal(c.end_time),
          location: c.location || '',
          capacity: c.capacity || 1,
          status: c.status || 'draft',
        });
      } catch {
        setError('Something went wrong.');
      } finally {
        setLoading(false);
      }
    }

    if (id) loadCourse();
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? Number(value) : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Update failed.');
        return;
      }

      router.push('/admin/courses');
    } catch {
      setError('Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

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
          Edit Course
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
          Update course details, schedule, capacity, and publication status.
        </p>
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

      {/* FORM */}
      <div className="glass-panel" style={{ padding: 24 }}>
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
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* ACTIONS */}
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
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

          </div>

        </form>
      </div>

    </div>
  );
}
