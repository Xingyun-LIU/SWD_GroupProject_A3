import { prisma } from "@/lib/prisma"
import { success, error } from "@/lib/response"
import { verifyAdmin } from "@/lib/auth"
import { NextRequest } from "next/server"

export async function GET(req) {
  try {
    await verifyAdmin(req)

    const now = new Date()

    const [
      totalCourses,
      publishedCourses,
      totalStudents,
      totalBookings,
      upcomingCourses,
    ] = await Promise.all([
      prisma.course.count(),

      prisma.course.count({
        where: {
          status: "published",
        },
      }),

      prisma.user.count({
        where: {
          role: "student",
        },
      }),

      prisma.booking.count(),

      prisma.course.count({
        where: {
          start_time: {
            gte: now,
          },
        },
      }),
    ])

    return success({
      totalCourses,
      publishedCourses,
      totalStudents,
      totalBookings,
      upcomingCourses,
    })
  } catch (err) {
    return error(err.message, 401)
  }
}