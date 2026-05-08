import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export function middleware(req) {
  const token = req.cookies.get('token')?.value;

  // only protect admin pages
  if (
    req.nextUrl.pathname.startsWith('/admin')
  ) {
    if (!token) {
      return NextResponse.redirect(
        new URL('/login', req.url)
      );
    }

    try {
      const decoded = jwt.verify(
        token,
        JWT_SECRET
      );

      if (decoded.role !== 'admin') {
        return NextResponse.redirect(
          new URL('/login', req.url)
        );
      }

    } catch {
      return NextResponse.redirect(
        new URL('/login', req.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

