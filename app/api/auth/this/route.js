import pool from '@/lib/db';

export async function GET(request) {
    try {
        const cookieHeader = request.headers.get('cookie') || '';
        const sessionMatch = cookieHeader.match(/(?:^|;\s*)session_token=([^;]+)/);
        const sessionToken = sessionMatch ? sessionMatch[1] : null;

        if (!sessionToken) {
            return Response.json({ error: 'Not authenticated.' }, { status: 401 });
        }

        const [rows] = await pool.execute(
            `SELECT users.id, users.username, users.email, users.role, users.status, sessions.expires_at
             FROM sessions
             JOIN users ON sessions.user_id = users.id
             WHERE sessions.session_token = ?`,
            [sessionToken]
        );

        if (rows.length === 0) {
            return Response.json({ error: 'Invalid session.' }, { status: 401 });
        }

        const session = rows[0];

        if (new Date(session.expires_at) < new Date()) {
            return Response.json({ error: 'Session expired.' }, { status: 401 });
        }

        if (session.status === 'disabled') {
            return Response.json({ error: 'Account disabled.' }, { status: 403 });
        }

        return Response.json({
            id: session.id,
            username: session.username || session.email,
            role: session.role,
        });

    } catch (error) {
        console.error('Auth check error:', error);
        return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
}