"use client";

import { useState } from "react";

export default function NewCoursePage() {

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    instructor: "",
    location: "",
    capacity: 30,
    status: "published",
    start_time: "",
    end_time: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch(
      "/api/admin/courses",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(form),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Course created");

    window.location.href =
      "/admin/courses";
  }

  return (
    <div>

      <h1
        className="
        text-5xl
        font-bold
        gradient-text
        mb-10
      "
      >
        Create Course
      </h1>

      <form
        onSubmit={handleSubmit}
        className="
        glass
        p-10
        space-y-6
      "
      >

        <input
          className="input"
          placeholder="Course Title"
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value,
            })
          }
        />

        <textarea
          className="input min-h-[140px]"
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description:
                e.target.value,
            })
          }
        />

        <div className="grid grid-cols-2 gap-6">

          <input
            className="input"
            placeholder="Category"
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category:
                  e.target.value,
              })
            }
          />

          <input
            className="input"
            placeholder="Instructor"
            value={form.instructor}
            onChange={(e) =>
              setForm({
                ...form,
                instructor:
                  e.target.value,
              })
            }
          />

        </div>

        <input
          className="input"
          placeholder="Location"
          value={form.location}
          onChange={(e) =>
            setForm({
              ...form,
              location:
                e.target.value,
            })
          }
        />

        <div className="grid grid-cols-2 gap-6">

          <input
            type="datetime-local"
            className="input"
            onChange={(e) =>
              setForm({
                ...form,
                start_time:
                  e.target.value,
              })
            }
          />

          <input
            type="datetime-local"
            className="input"
            onChange={(e) =>
              setForm({
                ...form,
                end_time:
                  e.target.value,
              })
            }
          />

        </div>

        <div className="grid grid-cols-2 gap-6">

          <input
            type="number"
            className="input"
            placeholder="Capacity"
            value={form.capacity}
            onChange={(e) =>
              setForm({
                ...form,
                capacity:
                  Number(
                    e.target.value
                  ),
              })
            }
          />

          <select
            className="input"
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status:
                  e.target.value,
              })
            }
          >
            <option value="draft">
              Draft
            </option>

            <option value="published">
              Published
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>

        </div>

        <button
          className="
          admin-btn
          w-full
        "
        >
          Create Course
        </button>

      </form>

    </div>
  );
}