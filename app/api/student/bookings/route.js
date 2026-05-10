// Return bookings for the current student.

import pool from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        // Read the session token from the cookie.
        const cookieHeader = request.headers.get('cookie') || '';
        const tokenMatch = cookieHeader.match(/session_token=([^;]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;

        if (!token) {
            return Response.json(
                { error: 'Not authenticated.' },
                { status: 401 }
            );
        }

        // Load the current student from the active session.
        const [sessionRows] = await pool.execute(
            `SELECT users.id, users.role
             FROM sessions
             JOIN users ON sessions.user_id = users.id
             WHERE sessions.session_token = ?
               AND sessions.expires_at > NOW()`,
            [token]
        );

        if (sessionRows.length === 0) {
            return Response.json(
                { error: 'Invalid session.' },
                { status: 401 }
            );
        }

        const user = sessionRows[0];

        if (user.role !== 'student') {
            return Response.json(
                { error: 'Access denied.' },
                { status: 403 }
            );
        }

        let sql = `
            SELECT
                bookings.id,
                bookings.user_id,
                bookings.course_id,
                bookings.status,
                bookings.booked_at,
                bookings.cancelled_at,
                courses.title AS course_title,
                courses.category,
                courses.instructor,
                courses.start_time,
                courses.end_time,
                courses.location
            FROM bookings
            JOIN courses ON bookings.course_id = courses.id
            WHERE bookings.user_id = ?
        `;

        const params = [user.id];

        // Filter bookings into the groups shown on the student pages.
        if (type === 'upcoming') {
            sql += `
                AND bookings.status = 'confirmed'
                AND courses.start_time >= NOW()
            `;
        }

        if (type === 'past') {
            sql += `
                AND courses.start_time < NOW()
            `;
        }

        if (type === 'cancelled') {
            sql += `
                AND bookings.status = 'cancelled'
            `;
        }

        sql += `
            ORDER BY courses.start_time ASC
        `;

        const [bookings] = await pool.execute(sql, params);

        return Response.json(
            { bookings },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get student bookings error:', error);
        return Response.json(
            { error: 'Internal server error.' },
            { status: 500 }
        );
    }
}
