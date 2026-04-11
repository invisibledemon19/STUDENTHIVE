'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

const navLinks = [
  { href: '/', label: 'Home', icon: '⌂' },
  { href: '/dashboard', label: 'Dashboard', icon: '◉' },
  { href: '/booking', label: 'Booking', icon: '◫' },
  { href: '/marketplace', label: 'Marketplace', icon: '◆' },
  { href: '/lost-found', label: 'Lost & Found', icon: '◎' },
  { href: '/about', label: 'About', icon: 'ⓘ' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (pathname === '/login') return null;

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h12l4 6-10 13L2 9z" />
              <path d="M12 22V9" />
              <path d="M2 9h20" />
            </svg>
          </div>
          <span className={styles.logoText}>StudentHive</span>
        </Link>

        <div className={`${styles.navLinks} ${mobileOpen ? styles.open : ''}`}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
            >
              {link.label}
              {pathname === link.href && <span className={styles.activeIndicator} />}
            </Link>
          ))}
          <Link href="/login" className={`btn btn-primary btn-sm ${styles.loginBtn}`}>
            Sign In
          </Link>
        </div>

        <button
          className={`${styles.mobileToggle} ${mobileOpen ? styles.open : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
