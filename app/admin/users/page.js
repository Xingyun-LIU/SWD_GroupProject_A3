"use client";

import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  async function loadUsers() {
    try {
      const res = await fetch("/api/admin/users");

      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await res.json();

      // 关键修复
      setUsers(Array.isArray(data.users) ? data.users : []);

    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  }

  async function toggleStatus(id, status) {
    try {
      await fetch(`/api/admin/users/${id}/status`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          status:
            status === "active"
              ? "disabled"
              : "active",
        }),
      });

      loadUsers();

    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div>
      <h1>User Management</h1>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.status}</td>

              <td>
                <button
                  onClick={() =>
                    toggleStatus(u.id, u.status)
                  }
                >
                  Toggle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}