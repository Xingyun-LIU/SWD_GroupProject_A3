export default function Sidebar() {
  return (
    <div className="w-64 h-screen glass p-6 space-y-4">
      <h2 className="gradient-text text-xl">Admin</h2>

      <a href="/admin/dashboard">Dashboard</a>
      <a href="/admin/courses">Courses</a>
      <a href="/admin/users">Users</a>
      <a href="/admin/bookings">Bookings</a>
    </div>
  );
}