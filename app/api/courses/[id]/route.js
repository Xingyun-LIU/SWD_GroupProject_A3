import pool from '@/lib/db';

// Return the details of the published course
// folder [id] will as the parameter of the {params}
export async function GET(request, { params }) {
    try {

        const { id } = await params;

        const [courses] = await pool.execute(
            `
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
                created_at,
                updated_at
            FROM courses
            WHERE id = ?
              AND status = 'published'
            `,
            [id]
        );

        if (courses.length === 0) {
            return Response.json(
                { error: 'Coures not found.' },
                { status: 404 }
            );
        }

        return Response.json(
            { courses: courses[0] },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get course detail error:', error);
        return Response.json(
            { error: 'Internal server error.' },
            { status: 500 }
        );
    }
}