import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { isPositiveInteger, isValidPassword } from '@/lib/validation';

// POST /api/admin/users/[id]/reset-password
export async function POST(request, { params }) {
    try {
        // Only an admin can reset another user's password.
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
        if (!isPositiveInteger(id)) {
            return Response.json({ error: 'Invalid user id.' }, { status: 400 });
        }

        const { newPassword } = await request.json();

        // Validate the new password before hashing it.
        if (!isValidPassword(newPassword)) {
            return Response.json({ error: 'newPassword must be 6-100 characters and include both letters and numbers.' }, { status: 400 });
        }

        // Check that the target user exists.
        const [targetRows] = await pool.execute(
            'SELECT id FROM users WHERE id = ?',
            [id]
        );

        if (targetRows.length === 0) {
            return Response.json({ error: 'User not found.' }, { status: 404 });
        }

        // Store only the hashed password.
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.execute(
            'UPDATE users SET password_hash = ? WHERE id = ?',
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
