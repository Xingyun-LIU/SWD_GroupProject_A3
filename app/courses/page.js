'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CoursesPage() {
    const router = useRouter();

    //Course list
    const [courses, setCourses] = useState([]);
    //Search keyword
    const [search, setSearch] = useState('');
    //Category filter
    const [category, setCategory] = useState('');
    //Loading state
    const [loading, setLoading] = useState(true);
    //Error message
    const [error, setError] = useState('');

    //Fetch course list from the backend                
    useEffect(() => {
        fetchCourses();
    }, []);

    async function fetchCourses() {
        try {
            setLoading(true);
            const res = await fetch('/api/courses');
            const data = await res.json();

            if (!res.ok) {
                setError('Failed to load courses.');
                return;
            }

            setCourses(data.courses);
        } catch (err) {
            setError('Failed to load courses.');
        } finally {
            setLoading(false);
        }
    }

    //Filter courses based on search keyword and category
    const filteredCourses = courses.filter((course) => {
        const matchSearch =
            course.title.toLowerCase().includes(search.toLowerCase()) ||
            course.description?.toLowerCase().includes(search.toLowerCase());
        const matchCategory = category === '' || course.category === category;
        return matchSearch && matchCategory;
    });

    //Get unique categories for the category filter dropdown
    const categories = [...new Set(courses.map((c) => c.category).filter(Boolean))];

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h1>Courses</h1>

            {/* Search box */}
            <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {/* Category filter */}
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map((cat) => (
                    <option key={cat} value={cat}>
                        {cat}
                    </option>
                ))}
            </select>

            {/* Course list */}
            {filteredCourses.length === 0 ? (
                <p>No courses found.</p>
            ) : (
                <div>
                    {filteredCourses.map((course) => (
                        <div
                            key={course.id}
                            onClick={() => router.push(`/courses/${course.id}`)}
                            style={{ cursor: 'pointer', border: '1px solid #ccc', margin: '8px', padding: '12px' }}
                        >
                            <h2>{course.title}</h2>
                            <p>{course.description}</p>
                            <p>Category: {course.category || 'Uncategorized'}</p>
                            <p>Status: {course.status === 'published' ? 'Available' : 'Cancelled'}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}