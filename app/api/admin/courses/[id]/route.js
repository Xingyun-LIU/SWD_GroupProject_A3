import pool from '@/lib/db';
import { isPositiveInteger, validateCourseInput } from '@/lib/validation';

// Check that the request belongs to an active admin session.
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

        if (!isPositiveInteger(id)) {
            return Response.json({ error: 'Invalid course id.' }, { status: 400 });
        }

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

        return Response.json({ course: rows[0] }, { status: 200 });

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

        if (!isPositiveInteger(id)) {
            return Response.json({ error: 'Invalid course id.' }, { status: 400 });
        }

        // Check that the course exists before updating it.
        const [existing] = await pool.execute(
            'SELECT id, enrolled_count FROM courses WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return Response.json({ error: 'Course not found.' }, { status: 404 });
        }

        const enrolledCount = existing[0].enrolled_count;

        const courseInput = await request.json();
        const validation = validateCourseInput(courseInput);

        if (validation.error) {
            return Response.json({ error: validation.error }, { status: 400 });
        }

        const course = validation.value;

        // Capacity cannot be lower than the number of enrolled students.
        if (course.capacity < enrolledCount) {
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
                course.title,
                course.description,
                course.category,
                course.instructor,
                course.start_time,
                course.end_time,
                course.location,
                course.capacity,
                course.status,
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

        if (!isPositiveInteger(id)) {
            return Response.json({ error: 'Invalid course id.' }, { status: 400 });
        }

        // Check if course exists
        const [existing] = await pool.execute(
            'SELECT id, enrolled_count FROM courses WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return Response.json({ error: 'Course not found.' }, { status: 404 });
        }

        // If there are bookings, cancel the course and its active bookings.
        if (existing[0].enrolled_count > 0) {
            const connection = await pool.getConnection();

            try {
                await connection.beginTransaction();

                await connection.execute(
                    "UPDATE courses SET status = 'cancelled', enrolled_count = 0 WHERE id = ?",
                    [id]
                );

                await connection.execute(
                    `UPDATE bookings
                     SET status = 'cancelled', cancelled_at = NOW()
                     WHERE course_id = ?
                       AND status = 'confirmed'`,
                    [id]
                );

                await connection.commit();

                return Response.json({
                    success: true,
                    soft_deleted: true,
                    message: 'Course and related active bookings have been cancelled.',
                });
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
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
