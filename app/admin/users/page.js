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
        if (status) params.set('status', status);

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
        console.error(error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [status]);

  async function toggleStatus(user) {
    const nextStatus = user.status === 'active' ? 'disabled' : 'active';
    const confirmed = confirm(`Set ${user.username} to ${nextStatus}?`);

    if (!confirmed) return;

    const res = await fetch(`/api/admin/users/${user.id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (!res.ok) {
      alert('Update failed');
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
      <div style={{ marginBottom: 24 }}>
        <p className="home-kicker">Admin Area</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', lineHeight: 1.1 }}>
          User Management
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
          Search users and enable or disable student accounts.
        </p>
      </div>

      <div className="glass-panel" style={{ marginBottom: 16 }}>
        <div className="toolbar">
          <div className="search-bar" style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Search username or email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="form-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            style={{ width: 170 }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>

          <div className="toolbar-right">
            <span className="page-info">Showing {filteredUsers.length} of {users.length}</span>
          </div>
        </div>
      </div>

      <div className="glass-panel">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-title">No users found</div>
            <div className="empty-desc">Try adjusting your search or filters.</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="td-mono">
                    <span className="id-chip">{user.id}</span>
                  </td>
                  <td className="td-primary">{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge badge-${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${user.status}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="td-mono">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleString()
                      : '-'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {user.role === 'student' ? (
                      <button
                        className={user.status === 'active' ? 'btn btn-danger btn-sm' : 'btn btn-primary btn-sm'}
                        type="button"
                        onClick={() => toggleStatus(user)}
                      >
                        {user.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                    ) : (
                      <span className="badge badge-admin">Admin account</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
