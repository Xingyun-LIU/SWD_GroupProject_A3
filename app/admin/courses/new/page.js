// Administrators create new courses.

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

        setForm((currentForm) => ({
            ...currentForm,
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to create course.');
                return;
            }

            router.push('/admin/courses');
        } catch (error) {
            console.error('Create course error:', error);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>Create New Course</h1>

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
                    </select>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Course'}
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
