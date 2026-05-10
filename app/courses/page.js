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
            <h1>Courses</h1>

            <div>
                <input
                    type="text"
                    placeholder="Search by name, description, or instructor"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
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
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
            </div>

            {filteredCourses.length === 0 ? (
                <p>No courses found.</p>
            ) : (
                <div>
                    {filteredCourses.map((course) => (
                        <div
                            key={course.id}
                            onClick={() => router.push(`/courses/${course.id}`)}
                            style={{
                                cursor: 'pointer',
                                border: '1px solid #ccc',
                                margin: '8px',
                                padding: '12px',
                            }}
                        >
                            <h2>{course.title}</h2>
                            <p>{course.description}</p>
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
                    ))}
                </div>
            )}
        </div>
    );
}
