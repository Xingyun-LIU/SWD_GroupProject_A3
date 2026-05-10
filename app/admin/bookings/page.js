'use client';

import { useEffect, useState } from 'react';

export default function AdminBookingsPage() {

  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadBookings() {

    try {

      setLoading(true);

      const params = new URLSearchParams();

      if (status) {
        params.set('status', status);
      }

      const url = params.toString()
        ? `/api/admin/bookings?${params.toString()}`
        : '/api/admin/bookings';

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await res.json();

      console.log(data);

      setBookings(
        Array.isArray(data.bookings)
          ? data.bookings
          : []
      );

    } catch (error) {

      console.error(
        'Load admin bookings error:',
        error
      );

      setBookings([]);

    } finally {

      setLoading(false);

    }
  }

  useEffect(() => {
    loadBookings();
  }, [status]);

  const filteredBookings =
    bookings.filter((booking) => {

      const keyword =
        search.toLowerCase();

      return (
        booking.student_username
          ?.toLowerCase()
          .includes(keyword) ||

        booking.student_email
          ?.toLowerCase()
          .includes(keyword) ||

        booking.course_title
          ?.toLowerCase()
          .includes(keyword)
      );
    });

  return (
    <div className="p-10">

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold">
          Booking Management
        </h1>

        <div className="flex gap-4">

          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="border px-4 py-2 rounded"
          />

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="border px-4 py-2 rounded"
          >

            <option value="">
              All Statuses
            </option>

            <option value="confirmed">
              Confirmed
            </option>

            <option value="cancelled">
              Cancelled
            </option>

          </select>

        </div>

      </div>

      {loading ? (

        <p>Loading bookings...</p>

      ) : filteredBookings.length === 0 ? (

        <p>No bookings found.</p>

      ) : (

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

            <thead>

              <tr className="border-b">

                <th className="p-4 text-left">
                  ID
                </th>

                <th className="p-4 text-left">
                  Student
                </th>

                <th className="p-4 text-left">
                  Email
                </th>

                <th className="p-4 text-left">
                  Course
                </th>

                <th className="p-4 text-left">
                  Course Time
                </th>

                <th className="p-4 text-left">
                  Status
                </th>

                <th className="p-4 text-left">
                  Booked At
                </th>

                <th className="p-4 text-left">
                  Cancelled At
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredBookings.map((booking) => (

                <tr
                  key={booking.id}
                  className="border-b"
                >

                  <td className="p-4">
                    {booking.id}
                  </td>

                  <td className="p-4">
                    {booking.student_username}
                  </td>

                  <td className="p-4">
                    {booking.student_email}
                  </td>

                  <td className="p-4">
                    {booking.course_title}
                  </td>

                  <td className="p-4">

                    {booking.course_start_time
                      ? `${new Date(
                          booking.course_start_time
                        ).toLocaleString()}
                         ~
                         ${new Date(
                           booking.course_end_time
                         ).toLocaleString()}`
                      : '-'}

                  </td>

                  <td className="p-4">

                    <span
                      className={`
                        px-3 py-1 rounded
                        ${
                          booking.status ===
                          'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }
                      `}
                    >
                      {booking.status}
                    </span>

                  </td>

                  <td className="p-4">

                    {booking.booked_at
                      ? new Date(
                          booking.booked_at
                        ).toLocaleString()
                      : '-'}

                  </td>

                  <td className="p-4">

                    {booking.cancelled_at
                      ? new Date(
                          booking.cancelled_at
                        ).toLocaleString()
                      : '-'}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}
