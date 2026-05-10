import pool from '@/lib/db';

// PUT /api/student/profile/username
export async function PUT(request) {
    try {
        //read the session_token from the cookie
        const cookieHeader = request.headers.get('cookie') || '';
        const tokenMatch = cookieHeader.match(/session_token=([^;]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;

        if (!token) {
            return Response.json({ error: 'Not authenticated.' }, { status: 401 });
        }

        //find the current user using the session_token
        const [sessionRows] = await pool.execute(
            `SELECT users.id, users.role FROM sessions
             JOIN users ON sessions.user_id = users.id
             WHERE sessions.session_token = ? AND sessions.expires_at > NOW()`,
            [token]
        );

        if (sessionRows.length === 0) {
            return Response.json({ error: 'Invalid session.' }, { status: 401 });
        }

        const user = sessionRows[0];

        if (user.role !== 'student') {
            return Response.json({ error: 'Access denied.' }, { status: 403 });
        }

        const { username } = await request.json();

        if (!username) {
            return Response.json({ error: 'Username is required.' }, { status: 400 });
        }

        //Check if the new username is already taken by another user
        const [existingRows] = await pool.execute(
            `SELECT id FROM users WHERE username = ? AND id != ?`,
            [username, user.id]
        );

        if (existingRows.length > 0) {
            return Response.json({ error: 'Username already taken.' }, { status: 400 });
        }

        await pool.execute(
            `UPDATE users SET username = ? WHERE id = ?`,
            [username, user.id]
        );

        return Response.json({ message: 'Username updated successfully.' });
    } catch (error) {
        console.error('Update username error:', error);
        return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
}