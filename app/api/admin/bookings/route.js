import pool from '@/lib/db';

// GET /api/admin/bookings
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get('courseId');
        const studentId = searchParams.get('studentId');
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '100');

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