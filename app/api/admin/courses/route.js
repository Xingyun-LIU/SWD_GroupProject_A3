import pool from '@/lib/db';
import { isSafeText, validateCourseInput } from '@/lib/validation';

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

// GET /api/admin/courses
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
        const search = searchParams.get('search');
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const date = searchParams.get('date');

        if (search && !isSafeText(search, 100)) {
            return Response.json({ error: 'Invalid search value.' }, { status: 400 });
        }

        if (category && !isSafeText(category, 50)) {
            return Response.json({ error: 'Invalid category value.' }, { status: 400 });
        }

        if (status && !['draft', 'published', 'cancelled'].includes(status)) {
            return Response.json({ error: 'Invalid course status.' }, { status: 400 });
        }

        if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return Response.json({ error: 'date must use YYYY-MM-DD format.' }, { status: 400 });
        }

        let sql = `
            SELECT
                id, title, description, category, instructor,
                start_time, end_time, location, capacity,
                enrolled_count,
                capacity - enrolled_count AS remaining_places,
                status, created_at
            FROM courses
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            sql += ` AND (title LIKE ? OR instructor LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }
        if (category) {
            sql += ` AND category = ?`;
            params.push(category);
        }
        if (status) {
            sql += ` AND status = ?`;
            params.push(status);
        }
        if (date) {
            sql += ` AND DATE(start_time) = ?`;
            params.push(date);
        }

        sql += ` ORDER BY created_at DESC`;

        const [courses] = await pool.execute(sql, params);
        return Response.json({ courses }, { status: 200 });

    } catch (error) {
        console.error('Admin GET courses error:', error);
        return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

// POST /api/admin/courses
export async function POST(request) {
    try {
        // Authenticate admin user
        const cookieHeader = request.headers.get('cookie') || '';
        const sessionMatch = cookieHeader.match(/(?:^|;\s*)session_token=([^;]+)/);
        const sessionToken = sessionMatch ? sessionMatch[1] : null;

        if (!sessionToken) {
            return Response.json({ error: 'Not authenticated.' }, { status: 401 });
        }

        const [sessionRows] = await pool.execute(
            `SELECT users.id, users.role FROM sessions
             JOIN users ON sessions.user_id = users.id
             WHERE sessions.session_token = ? AND sessions.expires_at > NOW()`,
            [sessionToken]
        );

        if (sessionRows.length === 0) {
            return Response.json({ error: 'Invalid session.' }, { status: 401 });
        }

        if (sessionRows[0].role !== 'admin') {
            return Response.json({ error: 'Forbidden.' }, { status: 403 });
        }

        const courseInput = await request.json();
        const validation = validateCourseInput(courseInput);

        if (validation.error) {
            return Response.json({ error: validation.error }, { status: 400 });
        }

        const course = validation.value;

        const [result] = await pool.execute(
            `INSERT INTO courses (title, description, category, instructor, start_time, end_time, location, capacity, enrolled_count, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
            [
                course.title,
                course.description,
                course.category,
                course.instructor,
                course.start_time,
                course.end_time,
                course.location,
                course.capacity,
                course.status,
            ]
        );

        return Response.json({ success: true, id: result.insertId }, { status: 201 });

    } catch (error) {
        console.error('Admin POST courses error:', error);
        return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
