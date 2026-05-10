import pool from '@/lib/db';
import { isSafeText } from '@/lib/validation';

async function verifyAdmin(request) {
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionMatch = cookieHeader.match(/(?:^|;\s*)session_token=([^;]+)/);
    const sessionToken = sessionMatch ? sessionMatch[1] : null;

    if (!sessionToken) return null;

    const [rows] = await pool.execute(
        `SELECT users.id, users.role
         FROM sessions
         JOIN users ON sessions.user_id = users.id
         WHERE sessions.session_token = ?
           AND sessions.expires_at > NOW()`,
        [sessionToken]
    );

    if (rows.length === 0 || rows[0].role !== 'admin') return null;

    return rows[0];
}

// GET /api/admin/users
export async function GET(request) {
    try {

        const admin = await verifyAdmin(request);

        if (!admin) {
            return Response.json(
                { error: 'Unauthorized.' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const status = searchParams.get('status');
        const role = searchParams.get('role');

        if (search && !isSafeText(search, 100)) {
            return Response.json({ error: 'Invalid search value.' }, { status: 400 });
        }

        if (status && !['active', 'disabled'].includes(status)) {
            return Response.json({ error: 'Invalid user status.' }, { status: 400 });
        }

        if (role && !['student', 'admin'].includes(role)) {
            return Response.json({ error: 'Invalid user role.' }, { status: 400 });
        }

        let sql = `
            SELECT id, username, email, role, status, created_at
            FROM users
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            sql += ` AND (username LIKE ? OR email LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }
        if (status) {
            sql += ` AND status = ?`;
            params.push(status);
        }
        if (role) {
            sql += ` AND role = ?`;
            params.push(role);
        }

        sql += ` ORDER BY created_at DESC`;

        const [users] = await pool.execute(sql, params);
        return Response.json({ users }, { status: 200 });

    } catch (error) {
        console.error('Admin users error:', error);
        return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
