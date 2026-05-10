// Cancel an existing student booking.

import pool from '@/lib/db';
import { isPositiveInteger } from '@/lib/validation';

// PUT /api/bookings/[id]/cancel
export async function PUT(request, { params }) {
    try {
        const { id } = await params;

        if (!isPositiveInteger(id)) {
            return Response.json({ error: 'Invalid booking id.' }, { status: 400 });
        }

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
            return Response.json({ error: 'Access denied.' }, { status: 403 });
        }

        // Load the booking and its course start time for cancellation rules.
        const [bookingRows] = await pool.execute(
            `SELECT bookings.id, bookings.status, bookings.user_id,
                    courses.start_time
             FROM bookings
             JOIN courses ON bookings.course_id = courses.id
             WHERE bookings.id = ?`,
            [id]
        );

        if (bookingRows.length === 0) {
            return Response.json({ error: 'Booking not found.' }, { status: 404 });
        }

        const booking = bookingRows[0];

        // Students can cancel only their own bookings.
        if (booking.user_id !== user.id) {
            return Response.json({ error: 'Access denied.' }, { status: 403 });
        }

        // Only confirmed bookings can be cancelled.
        if (booking.status !== 'confirmed') {
            return Response.json({ error: 'Booking is already cancelled.' }, { status: 400 });
        }

        // Disallow cancellation within 24 hours of the course start time.
        const now = new Date();
        const startTime = new Date(booking.start_time);
        const hoursUntilStart = (startTime - now) / (1000 * 60 * 60);

        if (hoursUntilStart < 24) {
            return Response.json(
                { error: 'Cannot cancel booking within 24 hours of course start.' },
                { status: 400 }
            );
        }

        // Mark the booking as cancelled and return one seat to the course.
        await pool.execute(
            `UPDATE bookings SET status = 'cancelled', cancelled_at = NOW() WHERE id = ?`,
            [id]
        );

        await pool.execute(
            `UPDATE courses SET enrolled_count = enrolled_count - 1
             WHERE id = (SELECT course_id FROM bookings WHERE id = ?)`,
            [id]
        );

        return Response.json({ message: 'Booking cancelled successfully.' });
    } catch (error) {
        console.error('Cancel booking error:', error);
        return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
