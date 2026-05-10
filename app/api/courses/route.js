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
        return Response.json({ courses }, { status: 200 });
    } catch (error) {
        console.error('Admin courses error:', error);
        return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

