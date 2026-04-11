'use client';
import { useState } from 'react';
import styles from './about.module.css';

const techStack = [
  { name:'Next.js', desc:'Server-side rendering & routing', icon:'⚡' },
  { name:'React', desc:'Component-based UI framework', icon:'⚛️' },
  { name:'Three.js', desc:'3D graphics & animations', icon:'🎨' },
  { name:'Node.js', desc:'Backend runtime environment', icon:'🟢' },
  { name:'Express.js', desc:'RESTful API framework', icon:'🚀' },
  { name:'PostgreSQL', desc:'Relational data integrity', icon:'🐘' },
];

const systemModules = [
  { title:'Intelligent Scheduling Engine', desc:'Zero-conflict booking system with real-time availability tracking across 10+ labs and 3 auditoriums. Approval-based workflows prevent double-bookings.', icon:'📅', color:'var(--primary-500)' },
  { title:'Fortress of Trust Marketplace', desc:'Secured peer-to-peer trading platform. Verified student identity, trust scoring, and category-smart filtering.', icon:'🛡️', color:'var(--accent-500)' },
  { title:'AI-Powered Lost & Found', desc:'Smart tagging and image recognition to match lost items with found reports. Location-based intelligence and automated notifications.', icon:'🔍', color:'var(--success)' },
];

const timeline = [
  { phase:'Phase 1', title:'Foundation', desc:'Architecture, database schema, and core auth.', status:'complete' },
  { phase:'Phase 2', title:'Core Features', desc:'Booking engine, marketplace, and lost & found.', status:'complete' },
  { phase:'Phase 3', title:'Intelligence Layer', desc:'AI matching, conflict prevention, analytics.', status:'complete' },
  { phase:'Phase 4', title:'Polish & Deploy', desc:'3D effects, animations, optimization, deploy.', status:'active' },
];

export default function AboutPage() {
  const [activeModule, setActiveModule] = useState(0);

  return (
    <div className={styles.page}><div className={styles.container}>
      <section className={styles.hero}><div className={styles.heroBadge}>About StudentHive</div><h1>Built by <span className="gradient-text">SAJAL AGARWAL</span></h1><p className={styles.heroDesc}>StudentHive is more than a campus tool — it&apos;s a unified digital ecosystem designed to solve the real challenges of campus management.</p></section>

      <section className={styles.creatorSection}>
        <div className={styles.creatorCard}><div className={styles.creatorGlow}/>
          <div className={styles.creatorAvatar}><span>SA</span></div>
          <div className={styles.creatorInfo}>
            <h2>SAJAL AGARWAL</h2><p className={styles.creatorRole}>Full-Stack Developer & Creative Technologist</p>
            <p className={styles.creatorBio}>Passionate about building products that solve real problems. Specializing in React, Three.js, Node.js architectures, and designing high-performance systems. StudentHive represents the vision of a seamless campus experience.</p>
            <div className={styles.creatorStats}><div><span className={styles.cStatVal}>6+</span><span className={styles.cStatLabel}>Pages Built</span></div><div><span className={styles.cStatVal}>3</span><span className={styles.cStatLabel}>Core Systems</span></div><div><span className={styles.cStatVal}>13+</span><span className={styles.cStatLabel}>Resources Managed</span></div><div><span className={styles.cStatVal}>∞</span><span className={styles.cStatLabel}>Passion</span></div></div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}><span className={styles.sectionTag}>Architecture</span><h2>System Modules</h2><p>Three integrated subsystems powering the campus ecosystem.</p></div>
        <div className={styles.modules}>
          <div className={styles.moduleNav}>{systemModules.map((m,i)=><button key={i} className={`${styles.moduleBtn} ${activeModule===i?styles.activeModule:''}`} onClick={()=>setActiveModule(i)}><span className={styles.moduleIcon}>{m.icon}</span><span>{m.title}</span></button>)}</div>
          <div className={styles.moduleDetail}><div className={styles.moduleDetailIcon} style={{background:`${systemModules[activeModule].color}20`,color:systemModules[activeModule].color}}>{systemModules[activeModule].icon}</div><h3>{systemModules[activeModule].title}</h3><p>{systemModules[activeModule].desc}</p></div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}><span className={styles.sectionTag}>Technology</span><h2>Tech Stack</h2></div>
        <div className={styles.techGrid}>{techStack.map((t,i)=><div key={i} className={styles.techCard}><span className={styles.techIcon}>{t.icon}</span><h4>{t.name}</h4><p>{t.desc}</p></div>)}</div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}><span className={styles.sectionTag}>Data Flow</span><h2>Integration Model</h2></div>
        <div className={styles.dataFlow}>
          <div className={styles.flowNode}><div className={styles.flowIcon} style={{background:'rgba(255,193,7,0.1)',color:'var(--primary-500)'}}>⚛️</div><h4>Frontend</h4><p>React / Next.js</p><span>Three.js 3D, SSR, Mobile UI</span></div>
          <div className={styles.flowArrow}>→</div>
          <div className={styles.flowNode}><div className={styles.flowIcon} style={{background:'rgba(0,200,83,0.1)',color:'var(--success)'}}>🟢</div><h4>Backend</h4><p>Node.js / Express</p><span>OTP, Booking Engine, API</span></div>
          <div className={styles.flowArrow}>→</div>
          <div className={styles.flowNode}><div className={styles.flowIcon} style={{background:'rgba(63,81,181,0.1)',color:'var(--accent-400)'}}>🐘</div><h4>Database</h4><p>PostgreSQL</p><span>Users, Schedules, Listings</span></div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}><span className={styles.sectionTag}>Development</span><h2>Project Timeline</h2></div>
        <div className={styles.timeline}>{timeline.map((p,i)=><div key={i} className={`${styles.timelineItem} ${styles[p.status]}`}><div className={styles.timelineDot}/><div className={styles.timelineContent}><span className={styles.timelinePhase}>{p.phase}</span><h4>{p.title}</h4><p>{p.desc}</p></div></div>)}</div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}><span className={styles.sectionTag}>Database</span><h2>PostgreSQL Schema</h2><p>Core tables for relational data integrity.</p></div>
        <div className={styles.schemaGrid}>
          <div className={styles.schemaCard}><h4>👤 Users</h4><ul><li>id (UUID, PK)</li><li>email (UNIQUE)</li><li>name (VARCHAR)</li><li>verified (BOOLEAN)</li><li>trust_score (DECIMAL)</li><li>created_at (TIMESTAMP)</li></ul></div>
          <div className={styles.schemaCard}><h4>📅 Resources</h4><ul><li>id (SERIAL, PK)</li><li>name (VARCHAR)</li><li>type (ENUM: lab/hall)</li><li>building (VARCHAR)</li><li>capacity (INT)</li><li>amenities (JSONB)</li></ul></div>
          <div className={styles.schemaCard}><h4>🔖 Bookings</h4><ul><li>id (UUID, PK)</li><li>user_id (FK → Users)</li><li>resource_id (FK → Resources)</li><li>date / start_time / end_time</li><li>status (ENUM)</li><li>purpose (TEXT)</li></ul></div>
          <div className={styles.schemaCard}><h4>🛒 Listings</h4><ul><li>id (UUID, PK)</li><li>seller_id (FK → Users)</li><li>title / category / price</li><li>condition (ENUM)</li><li>status (ENUM)</li></ul></div>
          <div className={styles.schemaCard}><h4>🔍 Lost & Found</h4><ul><li>id (UUID, PK)</li><li>reporter_id (FK → Users)</li><li>type (lost/found)</li><li>tags (TEXT[])</li><li>image_url (TEXT)</li><li>status (ENUM)</li></ul></div>
        </div>
      </section>

      <div className={styles.footerCredit}><p>Designed & Developed with ❤️ by</p><h2 className="gradient-text">SAJAL AGARWAL</h2><p className={styles.footerYear}>© 2026 StudentHive — All Rights Reserved</p></div>
    </div></div>
  );
}
