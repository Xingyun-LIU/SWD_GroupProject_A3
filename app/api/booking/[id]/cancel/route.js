import pool from '@/lib/db';

// PUT /api/bookings/[id]/cancel
export async function PUT(request, { params }) {
    try {
        const { id } = await params;

        //read the session_token from the cookie
        const cookieHeader = request.headers.get('cookie') || '';
        const tokenMatch = cookieHeader.match(/session_token=([^;]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;

        if (!token) {
            return Response.json({ error: 'Not authenticated.' }, { status: 401 });
        }

        //find the current user using the session_token
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

        //find this booking, also join courses to get course start time
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

        //only allow cancel own booking
        if (booking.user_id !== user.id) {
            return Response.json({ error: 'Access denied.' }, { status: 403 });
        }

        //only allow cancel confirmed booking
        if (booking.status !== 'confirmed') {
            return Response.json({ error: 'Booking is already cancelled.' }, { status: 400 });
        }

        //only allow cancel before 24 hours of course start
        const now = new Date();
        const startTime = new Date(booking.start_time);
        const hoursUntilStart = (startTime - now) / (1000 * 60 * 60);

        if (hoursUntilStart < 24) {
            return Response.json(
                { error: 'Cannot cancel booking within 24 hours of course start.' },
                { status: 400 }
            );
        }

        //Cancel the booking (update booking status to 'cancelled', set cancelled_at to now, and enrolled_count - 1)
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