import pool from '@/lib/db';

//GET /api/bookings
export async function GET(request) {
    try {
        //Read the session_token from the cookie
        const cookieHeader = request.headers.get('cookie') || '';
        const tokenMatch = cookieHeader.match(/session_token=([^;]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;

        if (!token) {
            return Response.json({ error: 'Not authenticated.' }, { status: 401 });
        }

        //Find the current user using the session_token
        const [sessionRows] = await pool.execute(
            `SELECT users.id FROM sessions
             JOIN users ON sessions.user_id = users.id
             WHERE sessions.session_token = ? AND sessions.expires_at > NOW()`,
            [token]
        );

        if (sessionRows.length === 0) {
            return Response.json({ error: 'Invalid session.' }, { status: 401 });
        }

        const userId = sessionRows[0].id;

        //Retrieve the booking list of the current user, including course information
        const [bookings] = await pool.execute(
            `SELECT bookings.id, bookings.status, bookings.created_at,
                    courses.id as course_id, courses.title as course_title,
                    courses.instructor, courses.category
             FROM bookings
             JOIN courses ON bookings.course_id = courses.id
             WHERE bookings.user_id = ?
             ORDER BY bookings.created_at DESC`,
            [userId]
        );

        return Response.json(bookings);
    } catch (error) {
        console.error('Get bookings error:', error);
        return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

// POST /api/bookings
export async function POST(request) {
    try {
        //Read the session_token from the cookie
        const cookieHeader = request.headers.get('cookie') || '';
        const tokenMatch = cookieHeader.match(/session_token=([^;]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;

        if (!token) {
            return Response.json({ error: 'Not authenticated.' }, { status: 401 });
        }

        //Find the current user using the session_token
        const [sessionRows] = await pool.execute(
            `SELECT users.id FROM sessions
             JOIN users ON sessions.user_id = users.id
             WHERE sessions.session_token = ? AND sessions.expires_at > NOW()`,
            [token]
        );

        if (sessionRows.length === 0) {
            return Response.json({ error: 'Invalid session.' }, { status: 401 });
        }

        const userId = sessionRows[0].id;

        //Retrieve the course_id from the request body
        const { course_id } = await request.json();

        if (!course_id) {
            return Response.json({ error: 'course_id is required.' }, { status: 400 });
        }

        //Check if the course exists and is published
        const [courseRows] = await pool.execute(
            `SELECT id, status FROM courses WHERE id = ?`,
            [course_id]
        );

        if (courseRows.length === 0) {
            return Response.json({ error: 'Course not found.' }, { status: 404 });
        }

        if (courseRows[0].status !== 'published') {
            return Response.json({ error: 'Course is not available for booking.' }, { status: 400 });
        }

        //Check if the user has already booked this course
        const [existingRows] = await pool.execute(
            `SELECT id FROM bookings
             WHERE user_id = ? AND course_id = ? AND status = 'confirmed'`,
            [userId, course_id]
        );

        if (existingRows.length > 0) {
            return Response.json({ error: 'You have already booked this course.' }, { status: 400 });
        }

        //Create a new booking (default status is 'confirmed')
        await pool.execute(
            `INSERT INTO bookings (user_id, course_id, status) VALUES (?, ?, 'confirmed')`,
            [userId, course_id]
        );

        return Response.json({ message: 'Booking created successfully.' }, { status: 201 });
    } catch (error) {
        console.error('Create booking error:', error);
        return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
}