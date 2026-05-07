import pool from '@/lib/db';

// Return all courses that in "published"
export async function GET(request) {

    try {
        // http://localhost:3000/api/courses?search=web&category=tech
        // Deconstruct the query parameter object and specifically handle the part after "?"
        const { searchParams } = new URL(request.url);

        const search = searchParams.get('search');
        const category = searchParams.get('category');
        const date = searchParams.get('date');

        let sql = `
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
        status
        FROM courses
        WHERE status = 'published'
        
        `;

        // Concatenate query
        const params = [];

        if (search) {
            sql += ` AND title LIKE ?`;
            params.push(`%${search}%`);
        }

        if (category) {
            sql += ` AND category = ?`;
            params.push(category);
        }

        if (date) {
            sql += ` AND DATE(start_time) = ?`;
            params.push(date);
        }

        sql += ` ORDER BY start_time ASC`;

        const [courses] = await pool.execute(sql, params);
        return Response.json({ courses }, { status: 200 });
    } catch (error) {
        return Response.json(
            { error: 'Internal server error.' },
            { status: 500 }
        );
    }
}