import { NextResponse } from 'next/server';

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // 1. Public path: No verification required
    const publicPaths = [
        '/auth/login',
        '/auth/register',
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/this',
    ];

    if (publicPaths.some(p => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    // 2. For paths that require protection, call `/api/auth/this` to verify the cookie
    try {
        const meUrl = new URL('/api/auth/this', request.url); // On the server side, absolute URLs must be used, not relative paths
        const response = await fetch(meUrl, {
            headers: {
                cookie: request.headers.get('cookie') || '',
            },
        });

        if (!response.ok) {
            // Not logged in or invalid session: Redirect to login page
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('redirect', pathname); // Can be redirected after logging in
            return NextResponse.redirect(loginUrl);
        }

        const user = await response.json();

        // 3. Students cannot access /admin, and administrators cannot access /student
        if (pathname.startsWith('/admin') && user.role !== 'admin') {
            // Character error: Can redirect to the appropriate dashboard
            const redirectTo = user.role === 'student' ? '/student/dashboard' : '/';
            return NextResponse.redirect(new URL(redirectTo, request.url));
        }

        if (pathname.startsWith('/student') && user.role !== 'student') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }

        // 4. Everything is normal, proceed with permission
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', user.id);
        requestHeaders.set('x-user-role', user.role);

        return NextResponse.next({  // Allow access using NextResponse.next()
            request: {
                headers: requestHeaders,
            },
        });
    } catch (error) {
        console.error('Middleware error:', error);
        const loginUrl = new URL('/auth/login', request.url);
        return NextResponse.redirect(loginUrl); // Redirect using NextResponse.redirect()
    }
}
