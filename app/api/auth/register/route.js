import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request) {
    try {
        const { username, email, password } = await request.json();

        // 1. Basic verification
        if (!username || !email || !password) {
            return Response.json(
                { error: 'All fields are required.' },
                { status: 400 }
            );
        }

        // 2. Check if the username or email address already exists
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return Response.json(
                { error: 'Username or email already exists.' },
                { status: 409 }
            );
        }

        // 3. Hash cryptography (10 salt wheels)
        const password_hash = await bcrypt.hash(password, 10);

        // 4. Insert a new user (default role is 'student', default status is 'active')
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, password_hash]
        );

        // 5. Return successful response
        return Response.json(
            { message: 'User registered successfully.', userId: result.insertId },
            { status: 201 }
        );

    } catch (error) {
        console.error('Register error:', error);
        return Response.json(
            { error: 'Internal server error.' },
            { status: 500 }
        );
    }
}