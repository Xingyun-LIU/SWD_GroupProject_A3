import Navbar from '@/components/Navbar';
import { DM_Sans, JetBrains_Mono, Playfair_Display } from 'next/font/google';
import './styles/globals.css';

const displayFont = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-display-loaded',
    display: 'swap',
});

const bodyFont = DM_Sans({
    subsets: ['latin'],
    variable: '--font-body-loaded',
    display: 'swap',
});

const monoFont = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-mono-loaded',
    display: 'swap',
});

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}>
            <body>
                <Navbar />
                <main className="app-main">
                    {children}
                </main>
            </body>
        </html>
    );
}
