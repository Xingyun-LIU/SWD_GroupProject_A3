import pool from '@/lib/db';
import { isPositiveInteger } from '@/lib/validation';

async function verifyAdmin(request) {
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionMatch = cookieHeader.match(/(?:^|;\s*)session_token=([^;]+)/);
    const sessionToken = sessionMatch ? sessionMatch[1] : null;

    if (!sessionToken) return null;

    const [rows] = await pool.execute(
        `SELECT users.id, users.role
         FROM sessions
         JOIN users ON sessions.user_id = users.id
         WHERE sessions.session_token = ?
           AND sessions.expires_at > NOW()`,
        [sessionToken]
    );

    if (rows.length === 0 || rows[0].role !== 'admin') return null;

    return rows[0];
}

// GET /api/admin/bookings
export async function GET(request) {
    try {

        const admin = await verifyAdmin(request);

        if (!admin) {
            return Response.json(
                { error: 'Unauthorized.' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get('courseId');
        const studentId = searchParams.get('studentId');
        const status = searchParams.get('status');
        const limitParam = searchParams.get('limit') || '100';

        if (courseId && !isPositiveInteger(courseId)) {
            return Response.json({ error: 'Invalid courseId.' }, { status: 400 });
        }

        if (studentId && !isPositiveInteger(studentId)) {
            return Response.json({ error: 'Invalid studentId.' }, { status: 400 });
        }

        if (status && !['confirmed', 'cancelled'].includes(status)) {
            return Response.json({ error: 'Invalid booking status.' }, { status: 400 });
        }

        if (!isPositiveInteger(limitParam)) {
            return Response.json({ error: 'Invalid limit.' }, { status: 400 });
        }

        const limit = Math.min(parseInt(limitParam, 10), 100);

        let sql = `
            SELECT
                b.id,
                u.username AS student_username,
                u.email AS student_email,
                c.title AS course_title,
                c.start_time AS course_start_time,
                c.end_time AS course_end_time,
                b.status,
                b.booked_at,
                b.cancelled_at
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN courses c ON b.course_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (courseId) {
            sql += ` AND b.course_id = ?`;
            params.push(courseId);
        }
        if (studentId) {
            sql += ` AND b.user_id = ?`;
            params.push(studentId);
        }
        if (status) {
            sql += ` AND b.status = ?`;
            params.push(status);
        }

        sql += ` ORDER BY b.booked_at DESC LIMIT ?`;
        params.push(limit);

        const [bookings] = await pool.execute(sql, params);
        return Response.json({ bookings }, { status: 200 });

    } catch (error) {
        console.error('Admin bookings error:', error);
        return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
