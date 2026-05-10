import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

// Input rules for registration fields.
const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
const unsafeHtmlRegex = /[<>]/;

export async function POST(request) {
    try {
        const { username, email, password } = await request.json();

        // Require all fields before running format checks.
        if (!username || !email || !password) {
            return Response.json(
                { error: 'All fields are required.' },
                { status: 400 }
            );
        }

        // Validate username, email, and password format on the server.
        if (!usernameRegex.test(username)) {
            return Response.json(
                { error: 'Username must be 3-30 characters and can only contain letters, numbers, and underscores.' },
                { status: 400 }
            );
        }

        if (!emailRegex.test(email)) {
            return Response.json(
                { error: 'Invalid email format.' },
                { status: 400 }
            );
        }

        if (!passwordRegex.test(password)) {
            return Response.json(
                { error: 'Password must be at least 6 characters and include both letters and numbers.' },
                { status: 400 }
            );
        }

        // Reject simple HTML tag input to reduce XSS risk.
        if (unsafeHtmlRegex.test(username) || unsafeHtmlRegex.test(email)) {
            return Response.json(
                { error: 'HTML tags are not allowed.' },
                { status: 400 }
            );
        }

        // Prevent duplicate accounts by checking both username and email.
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

        // Store only the hashed password, never the plain text password.
        const password_hash = await bcrypt.hash(password, 10);

        // New registered users use the database defaults: student and active.
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, password_hash]
        );

        // Return the new user id so the caller can confirm the account was created.
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
