// Administrator edits existing courses

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

function formatDateTimeLocal(value) {
    if (!value) return '';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const pad = (number) => String(number).padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
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

                const course = data.course || data;

                setForm({
                    title: course.title || '',
                    description: course.description || '',
                    category: course.category || '',
                    instructor: course.instructor || '',
                    start_time: formatDateTimeLocal(course.start_time),
                    end_time: formatDateTimeLocal(course.end_time),
                    location: course.location || '',
                    capacity: course.capacity || 1,
                    status: course.status || 'draft',
                });
            } catch (error) {
                console.error('Load course error:', error);
                setError('Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            loadCourse();
        }
    }, [id]);

    function handleChange(e) {
        const { name, value } = e.target;

        setForm((currentForm) => ({
            ...currentForm,
            [name]: name === 'capacity' ? Number(value) : value,
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const res = await fetch(`/api/admin/courses/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to update course.');
                return;
            }

            router.push('/admin/courses');
        } catch (error) {
            console.error('Update course error:', error);
            setError('Something went wrong. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p>Loading course...</p>;
    }

    return (
        <div>
            <h1>Edit Course</h1>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title</label>
                    <input
                        name="title"
                        type="text"
                        value={form.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label>Category</label>
                    <input
                        name="category"
                        type="text"
                        value={form.category}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label>Instructor</label>
                    <input
                        name="instructor"
                        type="text"
                        value={form.instructor}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Start Time</label>
                    <input
                        name="start_time"
                        type="datetime-local"
                        value={form.start_time}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>End Time</label>
                    <input
                        name="end_time"
                        type="datetime-local"
                        value={form.end_time}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Location</label>
                    <input
                        name="location"
                        type="text"
                        value={form.location}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label>Capacity</label>
                    <input
                        name="capacity"
                        type="number"
                        min="1"
                        value={form.capacity}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Status</label>
                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>

                <button
                    type="button"
                    onClick={() => router.push('/admin/courses')}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}
