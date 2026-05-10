import pool from '@/lib/db';

export async function POST(request) {
    try {
        // Read the session token from the cookie.
        const cookieHeader = request.headers.get('cookie') || '';
        const tokenMatch = cookieHeader.match(/session_token=([^;]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;

        if (token) {
            // Remove the saved server-side session.
            await pool.execute(
                'DELETE FROM sessions WHERE session_token = ?',
                [token]
            );
        }

        // Expire the browser cookie immediately.
        const response = Response.json(
            { message: 'Logged out successfully.' },
            { status: 200 }
        );

        response.headers.set(
            'Set-Cookie',
            'session_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict'
        );

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return Response.json(
            { error: 'Internal server error.' },
            { status: 500 }
        );
    }
}
