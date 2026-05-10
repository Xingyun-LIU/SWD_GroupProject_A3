'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentProfilePage() {
    const router = useRouter();

    //Current logged-in user information
    const [user, setUser] = useState(null);
    //Whether in edit mode
    const [editing, setEditing] = useState(false);
    //Username being edited
    const [username, setUsername] = useState('');
    //Password being edited
    const [password, setPassword] = useState('');
    //Message for update result
    const [message, setMessage] = useState('');
    //Loading state
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
    }, []);

    //Fetch current logged-in user information
    async function fetchUser() {
        try {
            const res = await fetch('/api/auth/this');
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setUsername(data.username);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    //Fetch updated user information
    async function fetchUser() {
        try {
            const res = await fetch('/api/auth/this');
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setUsername(data.username);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    //Submit update
    async function handleUpdate() {
        try {
            const body = { username };
            if (password) body.password = password;

            const res = await fetch('/api/auth/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Profile updated successfully.');
                setEditing(false);
                setPassword('');
                fetchUser();
            } else {
                setMessage(data.error || 'Failed to update profile');
            }
        } catch (err) {
            setMessage('Network error, please try again');
        }
    }

    //Logout
    async function handleLogout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/auth/login');
        } catch (err) {
            console.error(err);
        }
    }

    if (loading) return <div>Loading...</div>;
    if (!user) return <div>Please log in first</div>;

    return (
        <div>
            <button onClick={() => router.push('/student/dashboard')}>← Back</button>

            <h1>Profile</h1>

            {/* Message */}
            {message && <p>{message}</p>}

            {!editing ? (
                //View mode
                <div>
                    <p>Username: {user.username}</p>
                    <p>Role: {user.role === 'student' ? 'Student' : 'Administrator'}</p>
                    <button onClick={() => setEditing(true)}>Edit Profile</button>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            ) : (
                //Edit mode
                <div>
                    <div>
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>New Password (leave blank to keep current)</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Leave blank to keep current password"
                        />
                    </div>
                    <button onClick={handleUpdate}>Save</button>
                    <button onClick={() => {
                        setEditing(false);
                        setMessage('');
                        setPassword('');
                        setUsername(user.username);
                    }}>Cancel</button>
                </div>
            )}
        </div>
    );
}