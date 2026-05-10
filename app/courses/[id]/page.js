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

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="empty-state">
                <div className="empty-title">Course not found</div>
                <div className="empty-desc">The course may have been removed or is no longer published.</div>
                <button className="btn btn-ghost" type="button" onClick={() => router.push('/courses')}>
                    Back to Courses
                </button>
            </div>
        );
    }

    const canBook =
        course.status === 'published' &&
        course.remaining_places > 0 &&
        user?.role !== 'admin';

    return (
        <div>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => router.back()}>
                Back
            </button>

            <div className="glass-panel" style={{ padding: 28, marginTop: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'flex-start' }}>
                    <div>
                        <p className="home-kicker">Course Detail</p>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', lineHeight: 1.05 }}>
                            {course.title}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: 12, maxWidth: 760 }}>
                            {course.description}
                        </p>
                    </div>
                    <span className={`badge badge-${course.status}`}>
                        {course.status}
                    </span>
                </div>

                <div className="divider" />

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                        gap: 14,
                    }}
                >
                    <div className="glass-panel" style={{ padding: 16 }}>
                        <p className="form-label">Category</p>
                        <p>{course.category || 'Uncategorized'}</p>
                    </div>
                    <div className="glass-panel" style={{ padding: 16 }}>
                        <p className="form-label">Instructor</p>
                        <p>{course.instructor}</p>
                    </div>
                    <div className="glass-panel" style={{ padding: 16 }}>
                        <p className="form-label">Location</p>
                        <p>{course.location || '-'}</p>
                    </div>
                    <div className="glass-panel" style={{ padding: 16 }}>
                        <p className="form-label">Remaining</p>
                        <p>{course.remaining_places} places</p>
                    </div>
                    <div className="glass-panel" style={{ padding: 16 }}>
                        <p className="form-label">Capacity</p>
                        <p>{course.capacity}</p>
                    </div>
                    <div className="glass-panel" style={{ padding: 16 }}>
                        <p className="form-label">Enrolled</p>
                        <p>{course.enrolled_count}</p>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: 16, marginTop: 14 }}>
                    <p className="form-label">Time</p>
                    <p>
                        {course.start_time
                            ? new Date(course.start_time).toLocaleString()
                            : '-'}
                        {' '} - {' '}
                        {course.end_time
                            ? new Date(course.end_time).toLocaleString()
                            : '-'}
                    </p>
                </div>

                <div className="divider" />

                {user?.role === 'admin' ? (
                    <p className="empty-desc">Admins cannot book courses.</p>
                ) : course.remaining_places <= 0 ? (
                    <p className="empty-desc">This course is full.</p>
                ) : (
                    <button
                        className="btn btn-primary"
                        type="button"
                        onClick={handleBooking}
                        disabled={!canBook || booking}
                    >
                        {booking ? 'Booking...' : 'Book Now'}
                    </button>
                )}

                {message && (
                    <p style={{ marginTop: 14, color: message.includes('successful') ? 'var(--emerald)' : 'var(--ruby)' }}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}
