import Link from 'next/link';

const features = [
    {
        title: 'Browse courses',
        text: 'Search published courses by name, category, and date before opening the detail page.',
    },
    {
        title: 'Student bookings',
        text: 'Students can book available courses, review upcoming bookings, and cancel when allowed.',
    },
    {
        title: 'Admin management',
        text: 'Admins can manage courses, bookings, users, and view system statistics from one area.',
    },
];

const workflows = [
    'Register or log in with a student account',
    'Browse courses and check remaining places',
    'Book a course without time conflicts',
    'Review or cancel bookings from the student dashboard',
];

export default function HomePage() {
    return (
        <div className="home-page">
            <section className="home-hero">
                <div className="home-hero-copy">
                    <p className="home-kicker">Course Selection Application</p>
                    <h1>Plan, book, and manage course sessions in one place.</h1>
                    <p className="home-lead">
                        A simple booking system for students and administrators, built with
                        Next.js, MySQL, role-based access, and session authentication.
                    </p>

                    <div className="home-actions">
                        <Link href="/courses" className="btn btn-primary">
                            Browse Courses
                        </Link>
                        <Link href="/auth/login" className="btn btn-ghost">
                            Login
                        </Link>
                        <Link href="/auth/register" className="btn btn-ghost">
                            Register
                        </Link>
                    </div>
                </div>

                <div className="home-summary glass-panel">
                    <div className="panel-header">
                        <span className="panel-title">
                            <span className="panel-title-dot" />
                            Project Areas
                        </span>
                    </div>

                    <div className="home-summary-body">
                        <Link href="/student/dashboard" className="home-summary-row">
                            <span>Student dashboard</span>
                            <strong>/student/dashboard</strong>
                        </Link>
                        <Link href="/admin/dashboard" className="home-summary-row">
                            <span>Admin dashboard</span>
                            <strong>/admin/dashboard</strong>
                        </Link>
                        <Link href="/admin/courses" className="home-summary-row">
                            <span>Course management</span>
                            <strong>/admin/courses</strong>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="home-grid">
                {features.map((feature) => (
                    <article className="glass-panel home-card" key={feature.title}>
                        <h2>{feature.title}</h2>
                        <p>{feature.text}</p>
                    </article>
                ))}
            </section>

            <section className="glass-panel home-workflow">
                <div>
                    <p className="home-kicker">Student Flow</p>
                    <h2>Core path for the assignment demo</h2>
                </div>

                <ol>
                    {workflows.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ol>
            </section>
        </div>
    );
}