'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import { apiRequest } from '@/lib/client/api';
import { clearSession, getStoredUser } from '@/lib/client/session';

const resourceData = [
  { id: 1, name: 'Computer Lab A', type: 'lab', capacity: 40, status: 'available' },
  { id: 2, name: 'Computer Lab B', type: 'lab', capacity: 35, status: 'occupied' },
  { id: 3, name: 'Physics Lab', type: 'lab', capacity: 30, status: 'available' },
  { id: 4, name: 'Chemistry Lab', type: 'lab', capacity: 25, status: 'maintenance' },
  { id: 5, name: 'Electronics Lab', type: 'lab', capacity: 30, status: 'available' },
  { id: 6, name: 'Main Auditorium', type: 'hall', capacity: 500, status: 'occupied' },
  { id: 7, name: 'Mini Auditorium', type: 'hall', capacity: 150, status: 'available' },
  { id: 8, name: 'Conference Hall', type: 'hall', capacity: 80, status: 'available' },
];

const recentActivity = [
  { id: 1, action: 'Booked', resource: 'Computer Lab A', user: 'Priya M.', time: '5 min ago', type: 'booking' },
  { id: 2, action: 'Listed', resource: 'Engineering Textbook', user: 'Rahul K.', time: '12 min ago', type: 'marketplace' },
  { id: 3, action: 'Found', resource: 'Water Bottle', user: 'Ankit S.', time: '30 min ago', type: 'lost-found' },
  { id: 4, action: 'Cancelled', resource: 'Physics Lab', user: 'Sara L.', time: '1 hr ago', type: 'booking' },
  { id: 5, action: 'Sold', resource: 'Scientific Calculator', user: 'Vikram D.', time: '2 hr ago', type: 'marketplace' },
];

const upcomingBookings = [
  { id: 1, resource: 'Computer Lab A', date: 'Today', time: '2:00 PM - 4:00 PM', status: 'confirmed' },
  { id: 2, resource: 'Main Auditorium', date: 'Tomorrow', time: '10:00 AM - 12:00 PM', status: 'pending' },
  { id: 3, resource: 'Electronics Lab', date: 'Apr 14', time: '9:00 AM - 11:00 AM', status: 'confirmed' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(() => getStoredUser());
  const [currentTime, setCurrentTime] = useState(new Date());
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      router.push('/login');
      return undefined;
    }

    let mounted = true;
    apiRequest('/api/auth/me', { requireAuth: true })
      .then((response) => {
        if (mounted) {
          setUser(response.user);
        }
      })
      .catch(() => {
        clearSession();
        router.push('/login');
      });

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [router, userId]);

  const handleLogout = () => { clearSession(); router.push('/'); };
  if (!user) return null;

  const availableCount = resourceData.filter(r => r.status === 'available').length;
  const occupiedCount = resourceData.filter(r => r.status === 'occupied').length;

  return (
    <div className={styles.page}><div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.greeting}>Good {currentTime.getHours()<12?'Morning':currentTime.getHours()<17?'Afternoon':'Evening'}, <span className="gradient-text">{user.name}</span></h1>
          <p className={styles.subtitle}>{currentTime.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})} · {currentTime.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</p>
        </div>
        <div className={styles.headerActions}><button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Logout"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></button></div>
      </header>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statAvailable}`}><div className={styles.statIcon}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div><div className={styles.statInfo}><span className={styles.statValue}>{availableCount}</span><span className={styles.statLabel}>Available Now</span></div></div>
        <div className={`${styles.statCard} ${styles.statOccupied}`}><div className={styles.statIcon}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div><div className={styles.statInfo}><span className={styles.statValue}>{occupiedCount}</span><span className={styles.statLabel}>In Use</span></div></div>
        <div className={`${styles.statCard} ${styles.statMarket}`}><div className={styles.statIcon}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg></div><div className={styles.statInfo}><span className={styles.statValue}>24</span><span className={styles.statLabel}>Active Listings</span></div></div>
        <div className={`${styles.statCard} ${styles.statLost}`}><div className={styles.statIcon}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div><div className={styles.statInfo}><span className={styles.statValue}>8</span><span className={styles.statLabel}>Items to Recover</span></div></div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}><h2>Resource Availability</h2><Link href="/booking" className="btn btn-sm btn-secondary">View All →</Link></div>
          <div className={styles.resourceList}>
            {resourceData.map(r => (
              <div key={r.id} className={styles.resourceItem}>
                <div className={styles.resourceInfo}><div className={`${styles.resourceDot} ${styles[r.status]}`}/><div><span className={styles.resourceName}>{r.name}</span><span className={styles.resourceMeta}>{r.type==='lab'?'🧪':'🏛️'} Capacity: {r.capacity}</span></div></div>
                <div className={styles.resourceRight}><span className={`badge ${r.status==='available'?'badge-success':r.status==='occupied'?'badge-warning':'badge-error'}`}>{r.status}</span>{r.status==='available'&&<Link href="/booking" className="btn btn-sm btn-primary">Book</Link>}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}><h2>Your Bookings</h2></div>
            <div className={styles.bookingList}>
              {upcomingBookings.map(b => (
                <div key={b.id} className={styles.bookingItem}>
                  <div className={styles.bookingDate}><span className={styles.bookingDay}>{b.date}</span><span className={styles.bookingTime}>{b.time}</span></div>
                  <div className={styles.bookingMeta}><span className={styles.bookingResource}>{b.resource}</span><span className={`badge ${b.status==='confirmed'?'badge-success':'badge-warning'}`}>{b.status}</span></div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.panel}>
            <div className={styles.panelHeader}><h2>Recent Activity</h2></div>
            <div className={styles.activityList}>
              {recentActivity.map(item => (
                <div key={item.id} className={styles.activityItem}>
                  <div className={styles.activityIcon}>{item.type==='booking'?'📅':item.type==='marketplace'?'🛒':'🔍'}</div>
                  <div className={styles.activityInfo}><span><strong>{item.user}</strong> {item.action.toLowerCase()} <strong>{item.resource}</strong></span><span className={styles.activityTime}>{item.time}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.quickActions}>
        <h3>Quick Actions</h3>
        <div className={styles.actionGrid}>
          <Link href="/booking" className={styles.actionCard}><span className={styles.actionEmoji}>📅</span><span>Book a Resource</span></Link>
          <Link href="/marketplace" className={styles.actionCard}><span className={styles.actionEmoji}>📦</span><span>List an Item</span></Link>
          <Link href="/lost-found" className={styles.actionCard}><span className={styles.actionEmoji}>🔍</span><span>Report Lost Item</span></Link>
          <Link href="/about" className={styles.actionCard}><span className={styles.actionEmoji}>ℹ️</span><span>About Platform</span></Link>
        </div>
      </div>
    </div></div>
  );
}
