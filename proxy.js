import { NextResponse } from 'next/server';

export async function proxy(request) {
    const { pathname } = request.nextUrl;

    try {
        // In server side, wo can only use absolute path
        const meUrl = new URL('/api/auth/this', request.url);
        const response = await fetch(meUrl, {
            headers: {
                cookie: request.headers.get('cookie') || '',
            },
        });

        if (!response.ok) {
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        const user = await response.json();

        // Role in student can't get into admin, so as admin
        if (pathname.startsWith('/admin') && user.role !== 'admin') {
            const redirectTo = user.role === 'student' ? '/student/dashboard' : '/';
            return NextResponse.redirect(new URL(redirectTo, request.url));
        }

        if (pathname.startsWith('/student') && user.role !== 'student') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }

        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', user.id);
        requestHeaders.set('x-user-role', user.role);

        // Use NextResponse.next() to go pass, use NextResponse.redirect() to redirect
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    } catch (error) {
        console.error('Proxy error:', error);
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }
}

export const config = {
    matcher: ['/admin/:path*', '/student/:path*'],
};
