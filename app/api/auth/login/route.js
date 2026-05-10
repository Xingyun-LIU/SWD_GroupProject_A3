import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // hardcoded admin login for testing/demo purposes
    if (username === '123456' && password === '123456') {
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // make sure admin user exists, if not create it
      const [existing] = await pool.execute(
        'SELECT id FROM users WHERE username = ?',
        ['123456']
      );

      let adminId;
      if (existing.length === 0) {
        const [result] = await pool.execute(
          'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
          ['123456', 'admin@admin.com', 'hardcoded', 'admin', 'active']
        );
        adminId = result.insertId;
      } else {
        adminId = existing[0].id;
      }

      await pool.execute(
        'INSERT INTO sessions (session_token, user_id, expires_at) VALUES (?, ?, ?)',
        [sessionToken, adminId, expiresAt]
      );

      const response = NextResponse.json({ success: true, role: 'admin' });
      response.cookies.set('session_token', sessionToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    //normal user login
    const [users] = await pool.execute(
      'SELECT id, password, role, status FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    const user = users[0];

    if (user.status === 'disabled') {
      return NextResponse.json({ error: 'Account disabled.' }, { status: 403 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.execute(
      'INSERT INTO sessions (session_token, user_id, expires_at) VALUES (?, ?, ?)',
      [sessionToken, user.id, expiresAt]
    );

    const response = NextResponse.json({ success: true, role: user.role });
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;

  } catch (error) {
    console.error('LOGIN ERROR:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}


