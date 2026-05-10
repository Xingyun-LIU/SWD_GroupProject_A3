import pool from '@/lib/db';
import { isPositiveInteger } from '@/lib/validation';

// PUT /api/admin/users/[id]/status
export async function PUT(request, { params }) {
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
        if (!isPositiveInteger(id)) {
            return Response.json({ error: 'Invalid user id.' }, { status: 400 });
        }

        const { status } = await request.json();

        //check status value
        if (!['active', 'disabled'].includes(status)) {
            return Response.json({ error: 'status must be "active" or "disabled".' }, { status: 400 });
        }

        // check target user exists
        const [targetRows] = await pool.execute(
            'SELECT id, role FROM users WHERE id = ?',
            [id]
        );

        if (targetRows.length === 0) {
            return Response.json({ error: 'User not found.' }, { status: 404 });
        }

        //if disabling an admin, check if it's the last active admin
        if (status === 'disabled' && targetRows[0].role === 'admin') {
            const [activeAdmins] = await pool.execute(
                `SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND status = 'active'`
            );
            if (activeAdmins[0].count <= 1) {
                return Response.json({
                    error: 'Cannot disable the last active admin account.'
                }, { status: 400 });
            }
        }

        await pool.execute(
            'UPDATE users SET status = ? WHERE id = ?',
            [status, id]
        );

        return Response.json({
            success: true,
            message: `User ${status === 'active' ? 'enabled' : 'disabled'} successfully.`
        });

    } catch (error) {
        console.error('Update user status error:', error);
        return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
