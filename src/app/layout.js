import './globals.css';
import Navbar from '@/components/Navbar';
import CursorTrail from '@/components/CursorTrail';

export const metadata = {
  title: 'StudentHive — Unified Campus Ecosystem',
  description: 'A unified digital ecosystem for campus management. Zero-conflict resource booking, secure peer-to-peer marketplace, and AI-powered lost & found.',
  keywords: 'campus management, student portal, resource booking, marketplace, lost and found',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <CursorTrail />
        <Navbar />
        <main style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
