'use client';
import { useRouter, usePathname } from 'next/navigation';
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {

    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load the current user so the navigation can match their role.
    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch("/api/auth/this")
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, [pathname]);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
        router.push('/auth/login');
    };

    const navClass = (href) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return active ? 'site-nav-link active' : 'site-nav-link';
    };

    // Keep the header stable while the session request is loading.
    if (loading) {
        return (
            <nav className="site-nav">
                <div className="site-nav-inner">
                    <Link href="/" className="site-logo">CourseBooking</Link>
                    <span className="site-nav-status">Loading...</span>
                </div>
            </nav>
        );
    }

    return (
        <nav className="site-nav">
            <div className="site-nav-inner">
            <Link href="/" className="site-logo">CourseBooking</Link>

            <div className="site-nav-links">
            {!user && (
                <>
                    <Link className={navClass('/auth/login')} href="/auth/login">Login</Link>
                    <Link className={navClass('/auth/register')} href="/auth/register">Register</Link>
                </>
            )}

            {user && user.role === 'student' && (
                <>
                    <Link className={navClass('/courses')} href="/courses">Courses</Link>
                    <Link className={navClass('/student/dashboard')} href="/student/dashboard">Dashboard</Link>
                    <Link className={navClass('/student/bookings')} href="/student/bookings">Bookings</Link>
                    <Link className={navClass('/student/profile')} href="/student/profile">Profile</Link>
                    <span className="site-nav-user">Hi, {user.username} (Student)</span>
                    <button className="btn btn-ghost btn-sm" type="button" onClick={handleLogout}>Logout</button>
                </>
            )}

            {user && user.role === 'admin' && (
                <>
                    <Link className={navClass('/admin/dashboard')} href="/admin/dashboard">Dashboard</Link>
                    <Link className={navClass('/admin/courses')} href="/admin/courses">Courses</Link>
                    <Link className={navClass('/admin/bookings')} href="/admin/bookings">Bookings</Link>
                    <Link className={navClass('/admin/users')} href="/admin/users">Users</Link>
                    <span className="site-nav-user">Hi, {user.username} (Admin)</span>
                    <button className="btn btn-ghost btn-sm" type="button" onClick={handleLogout}>Logout</button>
                </>
            )}
            </div>
            </div>
        </nav>
    );
}

