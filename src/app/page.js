'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import FeatureCard from '@/components/FeatureCard';
import styles from './page.module.css';

const HeroScene = dynamic(() => import('@/components/HeroScene'), { ssr: false, loading: () => <div style={{ position: 'absolute', inset: 0 }} /> });

const features = [
  { icon: '📅', title: 'Zero-Conflict Booking', description: 'Intelligent scheduling engine that prevents double-bookings across labs, auditoriums, and facilities with real-time conflict detection.', gradient: 'linear-gradient(135deg, rgba(255,193,7,0.2), rgba(255,143,0,0.1))' },
  { icon: '🛒', title: 'Fortress Marketplace', description: 'Verified peer-to-peer trading with trust scores, secure escrow, and category-smart filters. Only verified students can list.', gradient: 'linear-gradient(135deg, rgba(63,81,181,0.2), rgba(26,35,126,0.1))' },
  { icon: '🔍', title: 'AI Lost & Found', description: 'Smart tagging, image recognition, and location-based matching to reunite students with their belongings faster.', gradient: 'linear-gradient(135deg, rgba(0,200,83,0.2), rgba(0,150,60,0.1))' },
  { icon: '📊', title: 'Live Dashboard', description: 'Real-time campus analytics. See resource availability, marketplace trends, and recovery stats from a single pane of glass.', gradient: 'linear-gradient(135deg, rgba(41,121,255,0.2), rgba(13,71,161,0.1))' },
  { icon: '🔐', title: '2-Step OTP Auth', description: 'University email verification with time-based OTP ensures only authentic students access the ecosystem.', gradient: 'linear-gradient(135deg, rgba(255,23,68,0.2), rgba(183,28,28,0.1))' },
  { icon: '⚡', title: 'Blazing Performance', description: 'Built on Next.js with server-side rendering. Minimal layout shifts, instant navigation, and optimized for all devices.', gradient: 'linear-gradient(135deg, rgba(255,214,0,0.2), rgba(245,127,23,0.1))' },
];

const stats = [
  { value: '10+', label: 'Campus Labs' },
  { value: '3', label: 'Auditoriums' },
  { value: '500+', label: 'Active Users' },
  { value: '99.9%', label: 'Uptime' },
];

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <HeroScene />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}><span className={styles.heroBadgeDot} />Campus Infrastructure Reimagined</div>
          <h1 className={styles.heroTitle}>The Unified<br /><span className="gradient-text">Campus Ecosystem</span></h1>
          <p className={styles.heroSubtitle}>StudentHive connects every corner of your campus — from booking labs to trading textbooks to recovering lost items — all in one intelligent, beautifully crafted platform.</p>
          <div className={styles.heroCTA}>
            <Link href="/login" className="btn btn-primary btn-lg">Get Started <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></Link>
            <Link href="/about" className="btn btn-secondary btn-lg">Learn More</Link>
          </div>
          <div className={styles.heroStats}>
            {stats.map((stat, i) => (<div key={i} className={styles.heroStat}><span className={styles.heroStatValue}>{stat.value}</span><span className={styles.heroStatLabel}>{stat.label}</span></div>))}
          </div>
        </div>
        <div className={styles.heroGradient} />
      </section>

      <section className={`section ${styles.features}`} id="features">
        <div className="container">
          <div className={styles.sectionHeader}><span className={styles.sectionTag}>Features</span><h2>Everything Your Campus Needs</h2><p>A complete toolkit designed for the modern student experience.</p></div>
          <div className={styles.featureGrid}>{features.map((f, i) => (<FeatureCard key={i} {...f} delay={i * 100} />))}</div>
        </div>
      </section>

      <section className={`section ${styles.howItWorks}`}>
        <div className="container">
          <div className={styles.sectionHeader}><span className={styles.sectionTag}>How It Works</span><h2>Three Simple Steps</h2><p>Get started with StudentHive in minutes.</p></div>
          <div className={styles.steps}>
            <div className={styles.step}><div className={styles.stepNumber}>01</div><h3>Verify Your Identity</h3><p>Sign in with your university email and verify via OTP.</p></div>
            <div className={styles.stepConnector} />
            <div className={styles.step}><div className={styles.stepNumber}>02</div><h3>Explore & Book</h3><p>Browse available labs, auditoriums, and marketplace listings.</p></div>
            <div className={styles.stepConnector} />
            <div className={styles.step}><div className={styles.stepNumber}>03</div><h3>Connect & Recover</h3><p>Trade with verified peers and let AI match your lost items.</p></div>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaCard}><div className={styles.ctaGlow} /><h2>Ready to Transform Your Campus?</h2><p>Join thousands of students already using StudentHive.</p><Link href="/login" className="btn btn-primary btn-lg">Start Now — It&apos;s Free</Link></div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M12 22V9"/><path d="M2 9h20"/></svg><span>StudentHive</span></div>
              <p>Built with ❤️ by <strong>SAJAL AGARWAL</strong></p>
            </div>
            <div className={styles.footerLinks}><Link href="/dashboard">Dashboard</Link><Link href="/booking">Booking</Link><Link href="/marketplace">Marketplace</Link><Link href="/lost-found">Lost & Found</Link><Link href="/about">About</Link></div>
          </div>
          <div className={styles.footerBottom}><p>© 2026 StudentHive. All rights reserved. Crafted by SAJAL AGARWAL.</p></div>
        </div>
      </footer>
    </div>
  );
}
