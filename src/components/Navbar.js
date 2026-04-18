/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getStoredUser, clearSession } from '@/lib/client/session';
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
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Check for logged-in user on mount and whenever the route changes
  useEffect(() => {
    setUser(getStoredUser());
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setDropdownOpen(false); }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = () => setDropdownOpen(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = useCallback(() => {
    clearSession();
    setUser(null);
    setDropdownOpen(false);
    router.push('/');
  }, [router]);

  if (pathname === '/login') return null;

  // Get initials for the avatar
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

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

          {user ? (
            <div className={styles.userMenu}>
              <button
                className={styles.avatarBtn}
                onClick={(e) => { e.stopPropagation(); setDropdownOpen(prev => !prev); }}
                aria-label="User menu"
              >
                <span className={styles.avatar}>{initials}</span>
                <span className={styles.userName}>{user.name}</span>
                <svg className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              {dropdownOpen && (
                <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.dropdownHeader}>
                    <span className={styles.dropdownName}>{user.name}</span>
                    <span className={styles.dropdownEmail}>{user.email}</span>
                  </div>
                  <div className={styles.dropdownDivider} />
                  <Link href="/dashboard" className={styles.dropdownItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                    Dashboard
                  </Link>
                  <button className={styles.dropdownItem} onClick={handleLogout}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className={`btn btn-primary btn-sm ${styles.loginBtn}`}>
              Sign In
            </Link>
          )}
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
