import {
  LayoutDashboard,
  BookOpen,
  Users,
  Calendar,
} from "lucide-react"
import Link from "next/link"

export default function AdminLayout({
  children,

}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-72 glass p-6 border-r border-white/10">
        <h1 className="text-3xl font-bold mb-10">
          Admin Panel
        </h1>
         <div className="space-y-3">
          <Link
            href="/admin"
            className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/10"
          >
            <LayoutDashboard />
            Dashboard
          </Link>

          <Link
            href="/admin/courses"
            className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/10"
          >
            <BookOpen />
            Courses
          </Link>

          <Link
            href="/admin/bookings"
            className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/10"
          >
           <Calendar />
            Bookings
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/10">
            <Users />
            Users
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-10">
        {children}
      </main>
    </div>
  );
}