import pool from '@/lib/db';

export async function GET(request) {
    try {
        // Read session_token from cookie
        const cookieHeader = request.headers.get('cookie') || '';
        const tokenMatch = cookieHeader.match(/session_token=([^;]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;

        if (!token) {
            return Response.json({ error: 'Not authenticated.' }, { status: 401 });
        }

        // Check sessions table，join users
        const [rows] = await pool.execute(
            `SELECT users.id, users.username, users.role, users.status, sessions.expires_at
       FROM sessions
       JOIN users ON sessions.user_id = users.id
       WHERE sessions.session_token = ?`,
            [token]
        );

        if (rows.length === 0) {
            return Response.json({ error: 'Invalid session.' }, { status: 401 });
        }

        const session = rows[0];

        // Check if it has expired
        if (new Date(session.expires_at) < new Date()) {
            return Response.json({ error: 'Session expired.' }, { status: 401 });
        }

        // Check if the user is disabled
        if (session.status === 'disabled') {
            return Response.json({ error: 'Account disabled.' }, { status: 403 });
        }

        // Return user information
        return Response.json({
            id: session.id,
            username: session.username,
            role: session.role,
        });
    } catch (error) {
        console.error('Auth check error:', error);
        return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
}