import pool from '@/lib/db';

// Helper function to verify admin session
async function verifyAdmin(request) {
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionMatch = cookieHeader.match(/(?:^|;\s*)session_token=([^;]+)/);
    const sessionToken = sessionMatch ? sessionMatch[1] : null;

    if (!sessionToken) return null;

    const [rows] = await pool.execute(
        `SELECT users.id, users.role FROM sessions
         JOIN users ON sessions.user_id = users.id
         WHERE sessions.session_token = ? AND sessions.expires_at > NOW()`,
        [sessionToken]
    );

    if (rows.length === 0 || rows[0].role !== 'admin') return null;
    return rows[0];
}

// GET /api/admin/courses/[id]
export async function GET(request, { params }) {
    try {
        const admin = await verifyAdmin(request);
        if (!admin) {
            return Response.json({ error: 'Unauthorized.' }, { status: 401 });
        }

        const { id } = await params;

        const [rows] = await pool.execute(
            `SELECT
                id, title, description, category, instructor,
                start_time, end_time, location, capacity,
                enrolled_count,
                capacity - enrolled_count AS remaining_places,
                status, created_at, updated_at
             FROM courses WHERE id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return Response.json({ error: 'Course not found.' }, { status: 404 });
        }

        return Response.json(rows[0], { status: 200 });

    } catch (error) {
        console.error('GET course error:', error);
        return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

// PUT /api/admin/courses/[id]
export async function PUT(request, { params }) {
    try {
        const admin = await verifyAdmin(request);
        if (!admin) {
            return Response.json({ error: 'Unauthorized.' }, { status: 401 });
        }

        const { id } = await params;

        // 检查课程是否存在
        const [existing] = await pool.execute(
            'SELECT id, enrolled_count FROM courses WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return Response.json({ error: 'Course not found.' }, { status: 404 });
        }

        const enrolledCount = existing[0].enrolled_count;

        const { title, description, category, instructor, start_time, end_time, location, capacity, status } = await request.json();

        //check required fields
        if (!title || !instructor || !start_time || !end_time || !capacity) {
            return Response.json({ error: 'title, instructor, start_time, end_time and capacity are required.' }, { status: 400 });
        }

        // end_time must be later than start_time
        if (new Date(end_time) <= new Date(start_time)) {
            return Response.json({ error: 'end_time must be later than start_time.' }, { status: 400 });
        }

        // capacity cannot be less than enrolled_count
        if (parseInt(capacity) < enrolledCount) {
            return Response.json({
                error: `capacity cannot be less than current enrolled count (${enrolledCount}).`
            }, { status: 400 });
        }

        await pool.execute(
            `UPDATE courses
             SET title = ?, description = ?, category = ?, instructor = ?,
                 start_time = ?, end_time = ?, location = ?, capacity = ?, status = ?
             WHERE id = ?`,
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
                id,
            ]
        );

        return Response.json({ success: true, message: 'Course updated successfully.' });

    } catch (error) {
        console.error('PUT course error:', error);
        return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

// DELETE /api/admin/courses/[id]
export async function DELETE(request, { params }) {
    try {
        const admin = await verifyAdmin(request);
        if (!admin) {
            return Response.json({ error: 'Unauthorized.' }, { status: 401 });
        }

        const { id } = await params;

        // Check if course exists
        const [existing] = await pool.execute(
            'SELECT id, enrolled_count FROM courses WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return Response.json({ error: 'Course not found.' }, { status: 404 });
        }

        // If there are bookings, soft delete by setting status to 'cancelled'
        if (existing[0].enrolled_count > 0) {
            await pool.execute(
                "UPDATE courses SET status = 'cancelled' WHERE id = ?",
                [id]
            );
            return Response.json({
                success: true,
                soft_deleted: true,
                message: 'Course has bookings and has been cancelled instead of deleted.',
            });
        }

        // No bookings, safe to hard delete
        await pool.execute('DELETE FROM courses WHERE id = ?', [id]);
        return Response.json({
            success: true,
            soft_deleted: false,
            message: 'Course deleted successfully.',
        });

    } catch (error) {
        console.error('DELETE course error:', error);
        return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
}