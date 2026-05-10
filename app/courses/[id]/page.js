// Show details of course

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function CourseDetailPage() {
    const router = useRouter();
    const { id } = useParams();

    const [course, setCourse] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        async function fetchCourse() {
            try {
                const res = await fetch(`/api/courses/${id}`);
                const data = await res.json();

                if (res.ok) {
                    setCourse(data.course || data.courses);
                }
            } catch {
                setCourse(null);
            } finally {
                setLoading(false);
            }
        }

        async function fetchUser() {
            try {
                const res = await fetch('/api/auth/this');

                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch {
                setUser(null);
            }
        }

        fetchCourse();
        fetchUser();
    }, [id]);

    async function handleBooking() {
        if (!user) {
            router.push('/auth/login');
            return;
        }

        if (user.role !== 'student') {
            setMessage('Only students can book courses.');
            return;
        }

        try {
            setBooking(true);
            setMessage('');

            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId: id }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Booking successful.');
                setCourse((currentCourse) => ({
                    ...currentCourse,
                    enrolled_count: currentCourse.enrolled_count + 1,
                    remaining_places: currentCourse.remaining_places - 1,
                }));
            } else {
                setMessage(data.error || 'Failed to book course.');
            }
        } catch {
            setMessage('Network error. Please try again.');
        } finally {
            setBooking(false);
        }
    }

    if (loading) return <p>Loading course...</p>;
    if (!course) return <p>Course not found.</p>;

    const canBook =
        course.status === 'published' &&
        course.remaining_places > 0 &&
        user?.role !== 'admin';

    return (
        <div>
            <button type="button" onClick={() => router.back()}>
                Back
            </button>

            <h1>{course.title}</h1>

            <p>{course.description}</p>
            <p>Category: {course.category || 'Uncategorized'}</p>
            <p>Instructor: {course.instructor}</p>

            <p>
                Time:{' '}
                {course.start_time
                    ? new Date(course.start_time).toLocaleString()
                    : '-'}
                {' '} - {' '}
                {course.end_time
                    ? new Date(course.end_time).toLocaleString()
                    : '-'}
            </p>

            <p>Location: {course.location || '-'}</p>
            <p>Capacity: {course.capacity}</p>
            <p>Enrolled: {course.enrolled_count}</p>
            <p>Remaining places: {course.remaining_places}</p>

            {user?.role === 'admin' ? (
                <p>Admins cannot book courses.</p>
            ) : course.remaining_places <= 0 ? (
                <p>This course is full.</p>
            ) : (
                <button
                    type="button"
                    onClick={handleBooking}
                    disabled={!canBook || booking}
                >
                    {booking ? 'Booking...' : 'Book Now'}
                </button>
            )}

            {message && <p>{message}</p>}
        </div>
    );
}
