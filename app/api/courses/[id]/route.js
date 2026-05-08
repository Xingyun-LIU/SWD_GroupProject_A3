import pool from '@/lib/db';

// Return the details of the published course
// folder [id] will as the parameter of the {params}
export async function GET(request, { params }) {
    try {

        const { id } = await params;

        const [courses] = await pool.execute(
            `
            SELECT
                id,
                title,
                description,
                category,
                instructor,
                start_time,
                end_time,
                location,
                capacity,
                enrolled_count,
                capacity - enrolled_count AS remaining_places,
                status,
                created_at,
                updated_at
            FROM courses
            WHERE id = ?
              AND status = 'published'
            `,
            [id]
        );

        if (courses.length === 0) {
            return Response.json(
                { error: 'Coures not found.' },
                { status: 404 }
            );
        }

        return Response.json(
            { courses: courses[0] },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get course detail error:', error);
        return Response.json(
            { error: 'Internal server error.' },
            { status: 500 }
        );
    }
}
/*delete */
export async function DELETE(
  req,
  { params }
) {
  try {
    await verifyAdmin(req)

    const bookingCount = await prisma.booking.count({
      where: {
        courseId: params.id,
        status: "booked",
      },
    })

    if (bookingCount > 0) {
      const cancelled = await prisma.course.update({
        where: {
          id: params.id,
        },

        data: {
          status: "cancelled",
        },
      })

      return success({
        message:
          "Course has bookings, status changed to cancelled",
        cancelled,
      })
    }

    await prisma.course.delete({
      where: {
        id: params.id,
      },
    })

    return success({
      message: "Course deleted successfully",
    })
  } catch (err) { 
    return error(err.message, 401)
  }
}