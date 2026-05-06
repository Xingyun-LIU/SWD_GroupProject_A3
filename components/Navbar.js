'use client';
import { useRouter, usePathname } from 'next/navigation';
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {

    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState(null); // {id, username, role} || null
    const [loading, setLoading] = useState(true);

    // Get user information
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
    }, [pathname]); // Fetch user state again when route change

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
        router.push('/auth/login');
    };

    // Show loading bar when loading
    if (loading) {
        return (
            <nav>
                Loading...
            </nav>
        );
    }

    return (
        <nav>
            <Link href="/">Home</Link>

            {!user && (
                <>
                    <Link href="/auth/login">Login</Link>
                    <Link href="/auth/register">Register</Link>
                </>
            )}

            {user && user.role === 'student' && (
                <>
                    <Link href="/courses">Courses</Link>
                    <Link href="/student/dashboard">My Dashboard</Link>
                    <Link href="/student/bookings">My Bookings</Link>
                    <Link href="/student/profile">Profile</Link>
                    <span>Hi, {user.username} (Student)</span>
                    <button onClick={handleLogout}>Logout</button>
                </>
            )}

            {user && user.role === 'admin' && (
                <>
                    <Link href="/admin/dashboard">Dashboard</Link>
                    <Link href="/admin/courses">Manage Courses</Link>
                    <Link href="/admin/bookings">All Bookings</Link>
                    <Link href="/admin/users">Users</Link>
                    <Link href="/admin/backup">Backup</Link>
                    <span>Hi, {user.username} (Admin)</span>
                    <button onClick={handleLogout}>Logout</button>
                </>
            )}
        </nav>
    );
}

