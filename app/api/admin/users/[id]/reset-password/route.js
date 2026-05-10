import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

// POST /api/admin/users/[id]/reset-password
export async function POST(request, { params }) {
    try {
        //check admin session
        const cookieHeader = request.headers.get('cookie') || '';
        const sessionMatch = cookieHeader.match(/(?:^|;\s*)session_token=([^;]+)/);
        const sessionToken = sessionMatch ? sessionMatch[1] : null;

        if (!sessionToken) {
            return Response.json({ error: 'Not authenticated.' }, { status: 401 });
        }

        const [sessionRows] = await pool.execute(
            `SELECT users.id, users.role FROM sessions
             JOIN users ON sessions.user_id = users.id
             WHERE sessions.session_token = ? AND sessions.expires_at > NOW()`,
            [sessionToken]
        );

        if (sessionRows.length === 0 || sessionRows[0].role !== 'admin') {
            return Response.json({ error: 'Unauthorized.' }, { status: 401 });
        }

        const { id } = await params;
        const { newPassword } = await request.json();

        // check new password
        if (!newPassword || newPassword.length < 6) {
            return Response.json({ error: 'newPassword must be at least 6 characters.' }, { status: 400 });
        }

        // check target user exists
        const [targetRows] = await pool.execute(
            'SELECT id FROM users WHERE id = ?',
            [id]
        );

        if (targetRows.length === 0) {
            return Response.json({ error: 'User not found.' }, { status: 404 });
        }

        // hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );

        return Response.json({
            success: true,
            message: 'Password reset successfully.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
}