'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function CourseDetailPage() {
    const router = useRouter();
    const { id } = useParams();

    //Course details
    const [course, setCourse] = useState(null);
    //Current logged-in user
    const [user, setUser] = useState(null);
    //Loading status
    const [loading, setLoading] = useState(true);
    //Acknowledgment of the appointment result
    const [message, setMessage] = useState('');
    //Booking button loading
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        fetchCourse();
        fetchUser();
    }, []);

    async function fetchCourse() {
        try {
            const res = await fetch(`/api/courses/${id}`);
            const data = await res.json();
            if (res.ok) {
                setCourse(data.courses);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    //Retrieve information about the currently logged-in user
    async function fetchUser() {
        try {
            const res = await fetch('/api/auth/this');
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            }
        } catch (err) {
            console.error(err);
        }
    }

    //Book course
    async function handleBooking() {
        if (!user) {
            router.push('/auth/login');
            return;
        }

        try {
            setBooking(true);
            setMessage('');

            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ course_id: id }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Success！');
            } else {
                setMessage(data.error || 'Failed to book course');
            }
        } catch (err) {
            setMessage('Network error,please try again');
        } finally {
            setBooking(false);
        }
    }

    if (loading) return <div>loading...</div>;
    if (!course) return <div>Course not found</div>;

    return (
        <div>
            <button onClick={() => router.back()}>← back</button>

            <h1>{course.title}</h1>
            <p>{course.description}</p>
            <p>Category: {course.category || 'Not categorized'}</p>
            <p>Instructor: {course.instructor}</p>
            <p>Capacity: {course.capacity} people</p>
            <p>Status: {course.status === 'published' ? 'Bookable' : 'Cancelled'}</p>

            {/* Only published status can be booked */}
            {course.status === 'published' && (
                <button onClick={handleBooking} disabled={booking}>
                    {booking ? 'Booking...' : 'Book Now'}
                </button>
            )}

            {/* Booking result notification */}
            {message && <p>{message}</p>}
        </div>
    );
}