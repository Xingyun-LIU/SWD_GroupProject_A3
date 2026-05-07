"use client";

import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  async function loadUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data);
  }

  async function toggleStatus(id, status) {

    await fetch(`/api/admin/users/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({
        status:
          status === "active"
            ? "disabled"
            : "active",
      }),
    });

    loadUsers();
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