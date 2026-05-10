import Navbar from '@/components/Navbar';
import './styles/globals.css';

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
            </head>
            <body>
                <Navbar />
                <main style={{ padding: '20px' }}>
                    {children}
                </main>
            </body>
        </html>
    );
}