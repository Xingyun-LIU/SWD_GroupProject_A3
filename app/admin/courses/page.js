// Administrators can view all courses, including draft, published, and cancelled
//  courses, and perform creation, editing, and deletion operations.

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);

        const res = await fetch('/api/admin/courses');

        if (!res.ok) {
          setCourses([]);
          return;
        }

        const data = await res.json();
        setCourses(data.courses || []);
      } catch (error) {
        console.error('Load admin courses error:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  async function deleteCourse(id) {
    const confirmed = confirm('Are you sure you want to delete this course?');

    if (!confirmed) return;

    const res = await fetch(`/api/admin/courses/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      alert('Failed to delete course.');
      return;
    }

    setCourses((currentCourses) =>
      currentCourses.filter((course) => course.id !== id)
    );
  }

  // Filter courses by title, instructor or categories
  const filteredCourses = courses.filter((course) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      course.title?.toLowerCase().includes(keyword) ||
      course.instructor?.toLowerCase().includes(keyword) ||
      course.category?.toLowerCase().includes(keyword);

    const matchesStatus = status ? course.status === status : true;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <h1>Course Management</h1>

      <div>
        <input
          type="text"
          placeholder="Search by title, instructor, or category"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <Link href="/admin/courses/new">
          New Course
        </Link>
      </div>

      {loading ? (
        <p>Loading courses...</p>
      ) : filteredCourses.length === 0 ? (
        <p>No courses found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Instructor</th>
              <th>Start Time</th>
              <th>Capacity</th>
              <th>Enrolled</th>
              <th>Remaining</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredCourses.map((course) => (
              <tr key={course.id}>
                <td>{course.id}</td>
                <td>{course.title}</td>
                <td>{course.category || '-'}</td>
                <td>{course.instructor}</td>
                <td>
                  {course.start_time
                    ? new Date(course.start_time).toLocaleString()
                    : '-'}
                </td>
                <td>{course.capacity}</td>
                <td>{course.enrolled_count}</td>
                <td>{course.remaining_places}</td>
                <td>{course.status}</td>
                <td>
                  <Link href={`/admin/courses/${course.id}/edit`}>
                    Edit
                  </Link>

                  <button
                    type="button"
                    onClick={() => deleteCourse(course.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
