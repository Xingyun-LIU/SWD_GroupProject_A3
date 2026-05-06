import pool from '@/lib/db';

export async function POST(request) {
    try {
        // Get session token from cookie
        const cookieHeader = request.headers.get('cookie') || '';
        const tokenMatch = cookieHeader.match(/session_token=([^;]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;

        if (token) {
            // Delete the session item
            await pool.execute(
                'DELETE FROM sessions WHERE session_token = ?',
                [token]
            );
        }

        // Delete broswer，Max-Age=0: Immediate expiration
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