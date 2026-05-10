import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

// PUT /api/auth/update
export async function PUT(request) {
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

        //Retrieve the username and password from the request body 
        const { username, password } = await request.json();

        if (!username) {
            return Response.json({ error: 'Username is required.' }, { status: 400 });
        }

        //Check if the new username is already taken by another user
        const [existingRows] = await pool.execute(
            `SELECT id FROM users WHERE username = ? AND id != ?`,
            [username, userId]
        );

        if (existingRows.length > 0) {
            return Response.json({ error: 'Username already taken.' }, { status: 400 });
        }

        if (password) {
            //Update both username and password
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.execute(
                `UPDATE users SET username = ?, password = ? WHERE id = ?`,
                [username, hashedPassword, userId]
            );
        } else {
            //Update only the username
            await pool.execute(
                `UPDATE users SET username = ? WHERE id = ?`,
                [username, userId]
            );
        }

        return Response.json({ message: 'Profile updated successfully.' });
    } catch (error) {
        console.error('Update profile error:', error);
        return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
}