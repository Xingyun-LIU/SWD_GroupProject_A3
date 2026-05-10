"use client";

import {
  useEffect,
  useState,
} from "react";

export default function BookingsPage() {

  const [bookings, setBookings] =
    useState([]);

  const [status, setStatus] =
    useState("");

  async function loadBookings() {

  try {

    let url =
      "/api/admin/bookings";

    if (status) {
      url += `?status=${status}`;
    }

    const res = await fetch(url);

    const data = await res.json();

    console.log(data);

    setBookings(
      Array.isArray(data.bookings)
        ? data.bookings
        : []
    );

  } catch (err) {

    console.error(err);

    setBookings([]);

  }
}

  useEffect(() => {
    loadBookings();
  }, [status]);

  return (
    <div>

      <div
        className="
        flex
        justify-between
        items-center
        mb-10
      "
      >

        <h1
          className="
          text-5xl
          font-bold
          gradient-text
        "
        >
          Booking Management
        </h1>

        <select
          className="input w-56"
          value={status}
          onChange={(e) =>
            setStatus(
              e.target.value
            )
          }
        >
          <option value="">
            All
          </option>

          <option value="confirmed">
            Confirmed
          </option>

          <option value="cancelled">
            Cancelled
          </option>
        </select>

      </div>

      <div className="glass overflow-hidden">

        <table className="w-full">

          <thead>

            <tr
              className="
              border-b
              border-white/10
            "
            >

              <th className="p-5 text-left">
                Student
              </th>

              <th className="p-5 text-left">
                Course
              </th>

              <th className="p-5 text-left">
                Status
              </th>

              <th className="p-5 text-left">
                Booked At
              </th>

            </tr>

          </thead>

         <tbody>

  {bookings.map((b) => (

    <tr
      key={b.id}
      className="table-row"
    >

      <td className="p-5">
        {b.student_email}
      </td>

      <td className="p-5">
        {b.course_title}
      </td>

      <td className="p-5">

        <span
          className={`
            px-4 py-2 rounded-xl
            ${
              b.status === "confirmed"
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }
          `}
        >
          {b.status}
        </span>

      </td>

      <td className="p-5">

        {new Date(
          b.booked_at
        ).toLocaleString()}

      </td>

    </tr>

  ))}

</tbody>

        </table>

      </div>

    </div>
  );
}