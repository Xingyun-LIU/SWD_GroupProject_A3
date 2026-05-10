import pool from '@/lib/db';

// GET /api/admin/users
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const status = searchParams.get('status');
        const role = searchParams.get('role');

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