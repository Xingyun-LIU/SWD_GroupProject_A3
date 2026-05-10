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

    if (loading) return <p>Loading profile...</p>;
    if (!user) return <p>Please log in first.</p>;

    return (
        <div>
            <button
                type="button"
                onClick={() => router.push('/student/dashboard')}
            >
                Back
            </button>

            <h1>Profile</h1>

            <section>
                <h2>Account Information</h2>
                <p>Username: {user.username}</p>
                <p>Role: {user.role}</p>
            </section>

            <section>
                <h2>Change Password</h2>

                {message && <p>{message}</p>}

                <form onSubmit={handlePasswordUpdate}>
                    <div>
                        <label>Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Update Password'}
                    </button>
                </form>
            </section>

            <section>
                <button type="button" onClick={handleLogout}>
                    Logout
                </button>
            </section>
        </div>
    );
}
