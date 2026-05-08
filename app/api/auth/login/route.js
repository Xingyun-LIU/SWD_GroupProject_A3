import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // admin login
    if (
      username === '123456' &&
      password === '123456'
    ) {
      const token = jwt.sign(
        {
          userId: 'admin-id',
          role: 'admin',
          username,
        },
        process.env.JWT_SECRET || '123456',
        {
          expiresIn: '7d',
        }
      );

      const response = NextResponse.json({
        success: true,
        role: 'admin',
      });

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    // normal login
    const [users] = await pool.execute(
      'SELECT id, password_hash, role, status FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    const user = users[0];

    if (user.status === 'disabled') {
      return NextResponse.json(
        { error: 'Account disabled.' },
        { status: 403 }
      );
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    const sessionToken = crypto.randomUUID();

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    await pool.execute(
      'INSERT INTO sessions (session_token, user_id, expires_at) VALUES (?, ?, ?)',
      [sessionToken, user.id, expiresAt]
    );

    const response = NextResponse.json({
      success: true,
      role: user.role,
    });

    response.cookies.set(
      'session_token',
      sessionToken,
      {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      }
    );

    return response;

  } catch (error) {
    console.error('LOGIN ERROR:', error);

    return NextResponse.json(
      {
        error: 'Internal server error.',
      },
      {
        status: 500,
      }
    );
  }
}


