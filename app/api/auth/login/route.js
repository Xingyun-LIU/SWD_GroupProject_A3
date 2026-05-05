import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import pool from '@/lib/db';

export async function POST(request) {
    try {
        const { username, password } = await request.json();

        // 1. Basic verification
        if (!username || !password) {
            return Response.json(
                { error: 'Username and password are required.' },
                { status: 400 }
            );
        }

        // 2. Find users
        const [users] = await pool.execute(
            'SELECT id, password_hash, role, status FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return Response.json(
                { error: 'Invalid username or password.' },
                { status: 401 }
            );
        }

        const user = users[0]; user

        // 3. Check if the user is disabled.
        if (user.status === 'disabled') {
            return Response.json(
                { error: 'Account is disabled. Please contact administrator.' },
                { status: 403 }
            );
        }

        // 4. Verify password（bcrypt.compare）
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return Response.json(
                { error: 'Invalid username or password.' },
                { status: 401 }
            );
        }

        // 5. Generate random session token（using crypto.randomUUID）
        const sessionToken = crypto.randomUUID();

        // 6. Set expiration time（7 days）
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // 7. Store the session in the database
        await pool.execute(
            'INSERT INTO sessions (session_token, user_id, expires_at) VALUES (?, ?, ?)',
            [sessionToken, user.id, expiresAt]
        );

        // 8. Create a response and set an httpOnly cookie
        const response = Response.json(
            {
                message: 'Login successful.',
                role: user.role,    // The front-end can redirect to the corresponding page based on the role
            },
            { status: 200 }
        );

        // Set cookie（httpOnly, sameSite strict, path /）
        response.headers.set(
            'Set-Cookie',
            `session_token=${sessionToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`
        );

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return Response.json(
            { error: 'Internal server error.' },
            { status: 500 }
        );
    }
}