// Student switch their own password

import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

// PUT /api/student/profile/password
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
            `SELECT users.id, users.role, users.password_hash FROM sessions
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

        //Get currentPassword and newPassword from request body
        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return Response.json({ error: 'Both current and new password are required.' }, { status: 400 });
        }

        //Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return Response.json({ error: 'Current password is incorrect.' }, { status: 400 });
        }

        //Hash the new password before saving
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.execute(
            `UPDATE users SET password_hash = ? WHERE id = ?`,
            [hashedPassword, user.id]
        );

        return Response.json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error('Update password error:', error);
        return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
}