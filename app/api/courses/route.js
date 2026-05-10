import pool from '@/lib/db';

export async function GET() {
    try {
        const [courses] = await pool.execute(`
            SELECT
                id,
                title,
                description,
                category,
                instructor,
                start_time,
                end_time,
                location,
                capacity,
                enrolled_count,
                capacity - enrolled_count AS remaining_places,
                status,
                created_at
            FROM courses
            ORDER BY created_at DESC
        `);
        return Response.json(courses, { status: 200 });
    } catch (error) {
        console.error('Admin courses error:', error);
        return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { id } = await request.json();
        await pool.execute('DELETE FROM courses WHERE id = ?', [id]);
        return Response.json({ success: true });
    } catch (error) {
        console.error('Delete course error:', error);
        return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
}