// Show information of current student, change username, password, logout

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentProfilePage() {
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch('/api/auth/this');

                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, []);

    async function handlePasswordUpdate(e) {
        e.preventDefault();
        setMessage('');

        if (!currentPassword || !newPassword) {
            setMessage('Please enter both current and new password.');
            return;
        }

        try {
            setSaving(true);

            const res = await fetch('/api/student/profile/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage(data.error || 'Failed to update password.');
                return;
            }

            setMessage('Password updated successfully.');
            setCurrentPassword('');
            setNewPassword('');
        } catch {
            setMessage('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    async function handleLogout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/auth/login');
        } catch {
            router.push('/auth/login');
        }
    }

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="empty-state">
                <div className="empty-title">Please log in first</div>
                <div className="empty-desc">You need to be signed in to manage your profile.</div>
                <button className="btn btn-primary" type="button" onClick={() => router.push('/auth/login')}>
                    Login
                </button>
            </div>
        );
    }

    return (
        <div>
            <button
                className="btn btn-ghost btn-sm"
                type="button"
                onClick={() => router.push('/student/dashboard')}
            >
                Back
            </button>

            <div style={{ margin: '18px 0 24px' }}>
                <p className="home-kicker">Student Area</p>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', lineHeight: 1.1 }}>
                    Profile
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
                    Review your account details and update your password.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 0.7fr) minmax(0, 1fr)', gap: 16 }}>
                <section className="glass-panel" style={{ padding: 24 }}>
                    <p className="home-kicker">Account</p>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                        Account Information
                    </h2>

                    <div className="divider" />

                    <div style={{ display: 'grid', gap: 14 }}>
                        <div>
                            <p className="form-label">Username</p>
                            <p>{user.username}</p>
                        </div>
                        <div>
                            <p className="form-label">Role</p>
                            <span className={`badge badge-${user.role}`}>
                                {user.role}
                            </span>
                        </div>
                    </div>

                    <div className="divider" />

                    <button className="btn btn-danger" type="button" onClick={handleLogout}>
                        Logout
                    </button>
                </section>

                <section className="glass-panel" style={{ padding: 24 }}>
                    <p className="home-kicker">Security</p>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                        Change Password
                    </h2>

                    {message && (
                        <p style={{ marginTop: 12, color: message.includes('successfully') ? 'var(--emerald)' : 'var(--ruby)' }}>
                            {message}
                        </p>
                    )}

                    <form onSubmit={handlePasswordUpdate} style={{ marginTop: 18 }}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Current Password</label>
                                <input
                                    className="form-input"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input
                                    className="form-input"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                            <button className="btn btn-primary" type="submit" disabled={saving}>
                                {saving ? 'Saving...' : 'Update Password'}
                            </button>
                            <button
                                className="btn btn-ghost"
                                type="button"
                                onClick={() => {
                                    setCurrentPassword('');
                                    setNewPassword('');
                                    setMessage('');
                                }}
                            >
                                Clear
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}
