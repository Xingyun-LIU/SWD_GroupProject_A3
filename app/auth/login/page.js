'use client';

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
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="glass w-full max-w-md p-10 rounded-3xl shadow-2xl">
                <h1 className="text-4xl font-bold text-center mb-2">
                    Login
                </h1>
                <p className="text-center text-gray-300 mb-8">
                    Smart Course Selection Platform
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        <label className="block mb-1">Username:</label>
                        <input
                            type="text"
                            className="w-full p-3 rounded bg-gray-800 border border-gray-700"
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mt-4 mb-6">
                        <label className="block mb-1">Password:</label>
                        <input
                            type="password"
                            className="w-full p-3 rounded bg-gray-800 border border-gray-700"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>
                
                    <button 
                        type="submit"
                        className="w-full p-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all font-semibold"
                    >
                        Login
                    </button>
                </form>
                
                {error && <p className="mt-4 text-center" style={{ color: 'red' }}>{error}</p>}
                
                <p className="mt-6 text-center text-sm text-gray-400">
                    Don&apos;t have an account? <a href="/auth/register" className="text-indigo-400 hover:underline">Register here</a>
                </p>
            </div>
        </div>
    );
}

