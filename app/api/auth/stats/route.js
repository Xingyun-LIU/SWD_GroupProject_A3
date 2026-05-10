import pool from '@/lib/db';

export async function GET() {
    try {
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