"use client";

import {
  useEffect,
  useState,
} from "react";

export default function EditCoursePage({
  params,
}) {

  const [form, setForm] =
    useState(null);

  useEffect(() => {

    fetch(
      `/api/admin/courses/${params.id}`
    )
      .then((res) => res.json())
      .then(setForm);

  }, [params.id]);

  async function updateCourse(e) {

    e.preventDefault();

    const res = await fetch(
      `/api/admin/courses/${params.id}`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(form),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Updated");
  }

  if (!form)
    return <div>Loading...</div>;

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
        Edit Course
      </h1>

      <form
        onSubmit={updateCourse}
        className="
        glass
        p-10
        space-y-6
      "
      >

        <input
          className="input"
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title:
                e.target.value,
            })
          }
        />

        <textarea
          className="input min-h-[140px]"
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description:
                e.target.value,
            })
          }
        />

        <input
          className="input"
          value={form.instructor}
          onChange={(e) =>
            setForm({
              ...form,
              instructor:
                e.target.value,
            })
          }
        />

        <button
          className="
          admin-btn
          w-full
        "
        >
          Save Changes
        </button>

      </form>

    </div>
  );
}