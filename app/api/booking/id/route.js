import pool from '@/lib/db';

// DELETE /api/bookings/[id]- Cancel the appointment.
export async function DELETE(request, { params }) {
    try {
        const { id } = params;

        //Read the session_token from the cookie
        const cookieHeader = request.headers.get('cookie') || '';
        const tokenMatch = cookieHeader.match(/session_token=([^;]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;

        if (!token) {
            return Response.json({ error: 'Not authenticated.' }, { status: 401 });
        }

        //Find the current user using the session_token
        const [sessionRows] = await pool.execute(
            `SELECT users.id FROM sessions
             JOIN users ON sessions.user_id = users.id
             WHERE sessions.session_token = ? AND sessions.expires_at > NOW()`,
            [token]
        );

        if (sessionRows.length === 0) {
            return Response.json({ error: 'Invalid session.' }, { status: 401 });
        }

        const userId = sessionRows[0].id;

        //Check if this booking belongs to the current user
        const [bookingRows] = await pool.execute(
            `SELECT id, status FROM bookings WHERE id = ? AND user_id = ?`,
            [id, userId]
        );

        if (bookingRows.length === 0) {
            return Response.json({ error: 'Booking not found.' }, { status: 404 });
        }

        if (bookingRows[0].status === 'cancelled') {
            return Response.json({ error: 'Booking is already cancelled.' }, { status: 400 });
        }

        //Cancel the booking (update status to 'cancelled')
        await pool.execute(
            `UPDATE bookings SET status = 'cancelled' WHERE id = ?`,
            [id]
        );

        return Response.json({ message: 'Booking cancelled successfully.' });
    } catch (error) {
        console.error('Cancel booking error:', error);
        return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
}