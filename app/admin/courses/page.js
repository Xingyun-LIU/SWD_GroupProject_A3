"use client";

import { useEffect, useState } from "react";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);

  async function loadCourses() {
    const res = await fetch("/api/admin/courses");
    const data = await res.json();
    setCourses(data);
  }

  async function deleteCourse(id) {
    if (!confirm("Delete course?")) return;

    await fetch(`/api/admin/courses/${id}`, {
      method: "DELETE",
    });

    loadCourses();
  }

  useEffect(() => {
    loadCourses();
  }, []);

  return (
    <div className="admin-page">

      <h1>Courses</h1>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Instructor</th>
            <th>Status</th>
            <th>Capacity</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {courses.map((c) => (
            <tr key={c.id}>
              <td>{c.title}</td>
              <td>{c.instructor}</td>
              <td>{c.status}</td>
              <td>{c.capacity}</td>

              <td>
                <button onClick={() => deleteCourse(c.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}