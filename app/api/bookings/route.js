import pool from '@/lib/db';
import { isPositiveInteger } from '@/lib/validation';

// Create a booking for the current student.
export async function POST(request) {
    try {
        // Read the session token from the cookie.
        const cookieHeader = request.headers.get('cookie') || '';
        const tokenMatch = cookieHeader.match(/session_token=([^;]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;

        if (!token) {
            return Response.json({ error: 'Not authenticated.' }, { status: 401 });
        }

        // Load the current user from the active session.
        const [sessionRows] = await pool.execute(
            `SELECT users.id, users.role FROM sessions
             JOIN users ON sessions.user_id = users.id
             WHERE sessions.session_token = ? AND sessions.expires_at > NOW()`,
            [token]
        );

        if (sessionRows.length === 0) {
            return Response.json({ error: 'Invalid session.' }, { status: 401 });
        }

        const user = sessionRows[0];

        if (user.role !== 'student') {
            return Response.json({ error: 'Only students can book courses.' }, { status: 403 });
        }

        // Read and validate the course id from the request body.
        const { courseId } = await request.json();

        if (!courseId) {
            return Response.json({ error: 'courseId is required.' }, { status: 400 });
        }

        if (!isPositiveInteger(courseId)) {
            return Response.json({ error: 'Invalid courseId.' }, { status: 400 });
        }

        // Load the course before checking availability.
        const [courseRows] = await pool.execute(
            `SELECT id, status, capacity, enrolled_count, start_time, end_time
             FROM courses WHERE id = ?`,
            [courseId]
        );

        if (courseRows.length === 0) {
            return Response.json({ error: 'Course not found.' }, { status: 404 });
        }

        const course = courseRows[0];

        if (course.status !== 'published') {
            return Response.json({ error: 'Course is not available for booking.' }, { status: 400 });
        }

        // Stop booking when the course has no remaining seats.
        if (course.enrolled_count >= course.capacity) {
            return Response.json({ error: 'Course is full.' }, { status: 400 });
        }

        // Prevent duplicate active bookings for the same course.
        const [existingRows] = await pool.execute(
            `SELECT id FROM bookings
             WHERE user_id = ? AND course_id = ? AND status = 'confirmed'`,
            [user.id, courseId]
        );

        if (existingRows.length > 0) {
            return Response.json({ error: 'You have already booked this course.' }, { status: 400 });
        }

        // Prevent overlapping confirmed bookings for published courses.
        const [conflictRows] = await pool.execute(
            `SELECT bookings.id FROM bookings
             JOIN courses ON bookings.course_id = courses.id
             WHERE bookings.user_id = ?
               AND bookings.status = 'confirmed'
               AND courses.status = 'published'
               AND courses.start_time < ?
               AND courses.end_time > ?`,
            [user.id, course.end_time, course.start_time]
        );

        if (conflictRows.length > 0) {
            return Response.json({ error: 'This course conflicts with another booking.' }, { status: 400 });
        }

        // Save the booking and increase the course enrolment count.
        await pool.execute(
            `INSERT INTO bookings (user_id, course_id, status) VALUES (?, ?, 'confirmed')`,
            [user.id, courseId]
        );

        await pool.execute(
            `UPDATE courses SET enrolled_count = enrolled_count + 1 WHERE id = ?`,
            [courseId]
        );

        return Response.json({ message: 'Booking created successfully.' }, { status: 201 });
    } catch (error) {
        console.error('Create booking error:', error);
        return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
