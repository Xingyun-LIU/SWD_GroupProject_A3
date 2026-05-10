'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function RegisterPage() {
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess('Registration successful! You can now log in.');
                setForm({ username: '', email: '', password: '' });
            } else {
                setError(data.error || 'Registration failed.');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div style={{ maxWidth: 520, margin: '42px auto' }}>
            <div className="glass-panel" style={{ padding: 28 }}>
                <p className="home-kicker">Create Account</p>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', lineHeight: 1.1 }}>
                    Register
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
                    Create a student account to browse and book published courses.
                </p>

                <div className="divider" />

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
                <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                        className="form-input"
                        type="text"
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                        className="form-input"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                        className="form-input"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                    />
                </div>
                <button className="btn btn-primary" type="submit">Register</button>
            </form>

            {error && <p style={{ color: 'var(--ruby)', marginTop: 14 }}>{error}</p>}
            {success && <p style={{ color: 'var(--emerald)', marginTop: 14 }}>{success}</p>}

            <p style={{ color: 'var(--text-secondary)', marginTop: 18, fontSize: '0.9rem' }}>
                Already have an account?{' '}
                <Link className="site-nav-link" href="/auth/login">Login here</Link>
            </p>
            </div>
        </div>
    );
}
