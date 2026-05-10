import pool from '@/lib/db';

// Check that the request belongs to an active admin session.
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

export async function GET(request) {
    try {

        // Dashboard statistics are admin-only.
        const admin = await verifyAdmin(request);

        if (!admin) {
            return Response.json(
                { error: 'Unauthorized.' },
                { status: 401 }
            );
        }

        const [[courseRow]] = await pool.execute(
            'SELECT COUNT(*) as total FROM courses'
        );
        const [[publishedRow]] = await pool.execute(
            "SELECT COUNT(*) as total FROM courses WHERE status = 'published'"
        );
        const [[studentRow]] = await pool.execute(
            "SELECT COUNT(*) as total FROM users WHERE role = 'student'"
        );
        const [[bookingRow]] = await pool.execute(
            'SELECT COUNT(*) as total FROM bookings'
        );
        const [[upcomingRow]] = await pool.execute(
            "SELECT COUNT(*) as total FROM courses WHERE status = 'published' AND start_time > NOW()"
        );

        return Response.json({
            totalCourses: courseRow.total,
            publishedCourses: publishedRow.total,
            totalStudents: studentRow.total,
            totalBookings: bookingRow.total,
            upcomingCourses: upcomingRow.total,
        });
    } catch (error) {
        console.error('Stats error:', error);
        return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
