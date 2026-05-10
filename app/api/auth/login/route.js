import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import pool from '@/lib/db';

const loginIdentifierRegex = /^[a-zA-Z0-9_@.-]{3,100}$/;
const unsafeHtmlRegex = /[<>]/;

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Basic varification
    if (!username || !password) {
      return Response.json(
        { error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    // Format check by regex
    if (!loginIdentifierRegex.test(username)) {
      return Response.json(
        { error: 'Invalid username or email format.' },
        { status: 400 }
      );
    }
    // XSS attack
    if (unsafeHtmlRegex.test(username)) {
      return Response.json(
        { error: 'HTML tags are not allowed.' },
        { status: 400 }
      );
    }

    if (password.length > 100) {
      return Response.json(
        { error: 'Password is too long.' },
        { status: 400 }
      );
    }

    // You can login with username or email
    const [users] = await pool.execute(
      'SELECT id, password_hash, role, status FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      return Response.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    const user = users[0];

    if (user.status === 'disabled') {
      return Response.json(
        { error: 'Account is disabled. Please contact administrator.' },
        { status: 403 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return Response.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.execute(
      'INSERT INTO sessions (session_token, user_id, expires_at) VALUES (?, ?, ?)',
      [sessionToken, user.id, expiresAt]
    );

    const response = Response.json(
      {
        message: 'Login successful.',
        role: user.role,
      },
      { status: 200 }
    );

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
