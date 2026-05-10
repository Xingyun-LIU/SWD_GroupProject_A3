'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (res.ok) {
                // Jump to different dashboard base on different role
                if (data.role === 'admin') {
                    router.push('/admin/dashboard');
                } else {
                    router.push('/student/dashboard');
                }
            } else {
                setError(data.error || 'Login failed.');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div style={{ maxWidth: 520, margin: '42px auto' }}>
            <div className="glass-panel" style={{ padding: 28 }}>
                <p className="home-kicker">Welcome Back</p>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', lineHeight: 1.1 }}>
                    Login
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
                    Sign in to continue to your student or admin dashboard.
                </p>

                <div className="divider" />

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Username or Email</label>
                        <input
                            type="text"
                            className="form-input"
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>
                
                    <button 
                        type="submit"
                        className="btn btn-primary"
                    >
                        Login
                    </button>
                </form>
                
                {error && <p style={{ color: 'var(--ruby)', marginTop: 14 }}>{error}</p>}
                
                <p style={{ color: 'var(--text-secondary)', marginTop: 18, fontSize: '0.9rem' }}>
                    Don&apos;t have an account?{' '}
                    <Link className="site-nav-link" href="/auth/register">Register here</Link>
                </p>
            </div>
        </div>
    );
}

