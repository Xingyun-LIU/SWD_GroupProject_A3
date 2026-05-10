'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CoursesPage() {
    const router = useRouter();

    const [courses, setCourses] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchCourses() {
            try {
                const res = await fetch('/api/courses');
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || 'Failed to load courses.');
                    return;
                }

                setCourses(data.courses || []);
            } catch {
                setError('Failed to load courses.');
            } finally {
                setLoading(false);
            }
        }

        fetchCourses();
    }, []);

    // Filter Courses by title, description or instractor
    const filteredCourses = courses.filter((course) => {
        const keyword = search.toLowerCase();

        const matchSearch =
            course.title?.toLowerCase().includes(keyword) ||
            course.description?.toLowerCase().includes(keyword) ||
            course.instructor?.toLowerCase().includes(keyword);

        const matchCategory =
            category === '' || course.category === category;

        const matchDate =
            date === '' || course.start_time?.slice(0, 10) === date;

        return matchSearch && matchCategory && matchDate;
    });

    const categories = [
        ...new Set(courses.map((course) => course.category).filter(Boolean)),
    ];

    if (loading) return <p>Loading courses...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <p className="home-kicker">Course Catalog</p>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', lineHeight: 1.1 }}>
                    Browse Courses
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
                    Search published courses, filter by category or date, and open a course to book a place.
                </p>
            </div>

            <div className="glass-panel">
                <div className="toolbar">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search by name, description, or instructor"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        className="form-select"
                        style={{ width: 180 }}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    <input
                        className="form-input"
                        style={{ width: 180 }}
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />

                    <div className="toolbar-right">
                        <span className="page-info">
                            Showing {filteredCourses.length} of {courses.length}
                        </span>
                    </div>
                </div>

                {filteredCourses.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-title">No courses found</div>
                        <div className="empty-desc">Try changing the search keyword, category, or date.</div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: 12, padding: 24 }}>
                        {filteredCourses.map((course) => (
                            <div
                                key={course.id}
                                onClick={() => router.push(`/courses/${course.id}`)}
                                style={{
                                    cursor: 'pointer',
                                    padding: 20,
                                }}
                                className="glass-panel"
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
                                    <div>
                                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem' }}>
                                            {course.title}
                                        </h2>
                                        <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
                                            {course.description}
                                        </p>
                                    </div>
                                    <span className="badge badge-published">{course.status}</span>
                                </div>

                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                        gap: 12,
                                        marginTop: 18,
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.88rem',
                                    }}
                                >
                                    <p>Category: {course.category || 'Uncategorized'}</p>
                                    <p>Instructor: {course.instructor}</p>
                                    <p>
                                        Time:{' '}
                                        {course.start_time
                                            ? new Date(course.start_time).toLocaleString()
                                            : '-'}
                                    </p>
                                    <p>Location: {course.location || '-'}</p>
                                    <p>Remaining places: {course.remaining_places}</p>
                                </div>

                                <button className="btn btn-ghost btn-sm" type="button" style={{ marginTop: 16 }}>
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
