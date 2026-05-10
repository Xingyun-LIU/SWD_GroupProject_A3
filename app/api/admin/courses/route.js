import pool from '@/lib/db';

// GET /api/admin/courses
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const date = searchParams.get('date');

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
        return Response.json(courses, { status: 200 });

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

        const { title, description, category, instructor, start_time, end_time, location, capacity, status } = await request.json();

        // Validate required fields
        if (!title || !instructor || !start_time || !end_time || !capacity) {
            return Response.json({ error: 'title, instructor, start_time, end_time and capacity are required.' }, { status: 400 });
        }

        // end_time must be later than start_time
        if (new Date(end_time) <= new Date(start_time)) {
            return Response.json({ error: 'end_time must be later than start_time.' }, { status: 400 });
        }

        // capacity must be a positive integer
        if (parseInt(capacity) <= 0) {
            return Response.json({ error: 'capacity must be greater than 0.' }, { status: 400 });
        }

        const [result] = await pool.execute(
            `INSERT INTO courses (title, description, category, instructor, start_time, end_time, location, capacity, enrolled_count, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
            [
                title,
                description || null,
                category || null,
                instructor,
                start_time,
                end_time,
                location || null,
                parseInt(capacity),
                status || 'draft',
            ]
        );

        return Response.json({ success: true, id: result.insertId }, { status: 201 });

    } catch (error) {
        console.error('Admin POST courses error:', error);
        return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
}