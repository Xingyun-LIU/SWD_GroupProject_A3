import pool from '@/lib/db';
import { isPositiveInteger } from '@/lib/validation';

// Return one published course for the public course detail page.
export async function GET(request, { params }) {
    try {

        const { id } = await params;

        if (!isPositiveInteger(id)) {
            return Response.json(
                { error: 'Invalid course id.' },
                { status: 400 }
            );
        }

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
                { error: 'Course not found.' },
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
