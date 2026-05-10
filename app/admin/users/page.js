'use client';

import { useEffect, useState } from 'react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);

        const params = new URLSearchParams();

        if (status) {
          params.set('status', status);
        }

        const url = params.toString()
          ? `/api/admin/users?${params.toString()}`
          : '/api/admin/users';

        const res = await fetch(url);

        if (!res.ok) {
          setUsers([]);
          return;
        }

        const data = await res.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error('Load admin users error:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [status]);

  async function toggleStatus(user) {
    const nextStatus = user.status === 'active' ? 'disabled' : 'active';

    const confirmed = confirm(
      `Are you sure you want to set ${user.username} to ${nextStatus}?`
    );

    if (!confirmed) return;

    const res = await fetch(`/api/admin/users/${user.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: nextStatus,
      }),
    });

    if (!res.ok) {
      alert('Failed to update user status.');
      return;
    }

    setUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        currentUser.id === user.id
          ? { ...currentUser, status: nextStatus }
          : currentUser
      )
    );
  }

  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase();

    return (
      user.username?.toLowerCase().includes(keyword) ||
      user.email?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div>
      <h1>User Management</h1>

      <div>
        <input
          type="text"
          placeholder="Search by username or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : filteredUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                <td>
                  {user.created_at
                    ? new Date(user.created_at).toLocaleString()
                    : '-'}
                </td>
                <td>
                  {user.role === 'student' ? (
                    <button
                      type="button"
                      onClick={() => toggleStatus(user)}
                    >
                      {user.status === 'active'
                        ? 'Disable'
                        : 'Enable'}
                    </button>
                  ) : (
                    <span>Admin account</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
