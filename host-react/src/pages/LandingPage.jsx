import React, { useState, useEffect } from 'react'
import LoginModal from '../components/LoginModal.jsx'
import styles from './LandingPage.module.css'


function ArchDiagram() {
  return (
    <div className={styles.archDiagram}>
      <div className={styles.archLabel}>micro-frontend architecture</div>
      <div className={styles.archGrid}>
        {/* Host */}
        <div className={`${styles.archNode} ${styles.nodeHost}`}>
          <span className={styles.nodeTag}>HOST</span>
          <span className={styles.nodeName}>React 18</span>
          <span className={styles.nodePort}>:3000</span>
          <div className={styles.nodeLines}>
            <div className={styles.nodeLine} />
            <div className={styles.nodeLine} />
          </div>
        </div>

        {/* Auth */}
        <div className={`${styles.archNode} ${styles.nodeAuth}`}>
          <span className={styles.nodeTag}>SHARED</span>
          <span className={styles.nodeName}>auth-core</span>
          <span className={styles.nodePort}>singleton</span>
        </div>

        {/* Remotes */}
        <div className={styles.archRemotes}>
          <div className={`${styles.archNode} ${styles.nodeVue}`}>
            <span className={styles.nodeTag}>REMOTE</span>
            <span className={styles.nodeName}>Vue 3</span>
            <span className={styles.nodePort}>:4202</span>
          </div>
          <div className={`${styles.archNode} ${styles.nodeAngular}`}>
            <span className={styles.nodeTag}>REMOTE</span>
            <span className={styles.nodeName}>Angular</span>
            <span className={styles.nodePort}>:4201</span>
          </div>
        </div>
      </div>
    </div>
  )
}


function FeatureCard({ icon, title, desc, tag, delay = 0 }) {
  return (
    <div className={styles.featureCard} style={{ animationDelay: `${delay}ms` }}>
      <div className={styles.featureIcon}>{icon}</div>
      <div className={styles.featureBody}>
        <div className={styles.featureHeader}>
          <h3 className={styles.featureTitle}>{title}</h3>
          {tag && <span className={styles.featureTag}>{tag}</span>}
        </div>
        <p className={styles.featureDesc}>{desc}</p>
      </div>
    </div>
  )
}


const DEMO_USERS = [
  {
    username: 'admin',   password: 'admin123',
    role: 'admin',       name: 'Alex Admin',
    color: '#e5393d',
    caps: ['Full write access', 'Deploy to production', 'Manage users', 'View all metrics'],
  },
  {
    username: 'dev',     password: 'dev123',
    role: 'developer',  name: 'Jordan Dev',
    color: '#4da6ff',
    caps: ['Write & merge PRs', 'View all metrics', 'No deployment access'],
  },
  {
    username: 'viewer',  password: 'viewer123',
    role: 'viewer',     name: 'Sam Viewer',
    color: '#37c97d',
    caps: ['Read-only access', 'View metrics & feed', 'No write access'],
  },
]


export default function LandingPage({ onLogin }) {
  const [showLogin, setShowLogin]       = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [scrolled, setScrolled]         = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  function handleDemoLogin(user) {
    setSelectedUser(user)
    setShowLogin(true)
  }

  return (
    <div className={styles.landing}>

      {/* ── Navbar ── */}
      <nav className={`${styles.navbar} ${scrolled ? styles.navScrolled : ''}`}>
        <div className={styles.navLogo}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <polygon points="10,1 19,6 19,14 10,19 1,14 1,6"
              stroke="var(--accent)" strokeWidth="1.5" fill="var(--accent-glow)"/>
            <circle cx="10" cy="10" r="2.5" fill="var(--accent)"/>
          </svg>
          <span className={styles.navLogoText}>DevPulse</span>
          <span className={styles.navBadge}>MVP</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#features" className={styles.navLink}>Features</a>
          <a href="#architecture" className={styles.navLink}>Architecture</a>
          <a href="#access" className={styles.navLink}>Access</a>
          <button className={styles.navCta} onClick={() => setShowLogin(true)}>
            Sign In →
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        {/* Background grid */}
        <div className={styles.heroGrid} aria-hidden />

        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            <span>Micro-Frontend · Module Federation · JWT Auth</span>
          </div>

          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleLine1}>The developer</span>
            <span className={styles.heroTitleLine2}>
              <em className={styles.heroItalic}>command center</em>
            </span>
            <span className={styles.heroTitleLine3}>your team needs.</span>
          </h1>

          <p className={styles.heroSub}>
            A cross-framework dashboard built with React, Vue, and Angular
            — all running as independent micro-frontends, sharing a single auth state.
          </p>

          <div className={styles.heroActions}>
            <button
              className={styles.heroPrimary}
              onClick={() => setShowLogin(true)}
            >
              <span>Launch Dashboard</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <a href="#architecture" className={styles.heroSecondary}>
              See how it works
            </a>
          </div>

          <div className={styles.heroStack}>
            <span className={styles.stackItem} style={{ color: '#61dafb' }}>React 18</span>
            <span className={styles.stackSep}>+</span>
            <span className={styles.stackItem} style={{ color: '#42b883' }}>Vue 3</span>
            <span className={styles.stackSep}>+</span>
            <span className={styles.stackItem} style={{ color: '#dd0031' }}>Angular 17</span>
            <span className={styles.stackSep}>via</span>
            <span className={styles.stackItem} style={{ color: 'var(--accent)' }}>Module Federation</span>
          </div>
        </div>

        {/* Hero right: arch diagram */}
        <div className={styles.heroRight}>
          <ArchDiagram />
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>// CAPABILITIES</span>
          <h2 className={styles.sectionTitle}>Built to demonstrate<br /><em>real micro-frontend patterns</em></h2>
        </div>

        <div className={styles.featuresGrid}>
          <FeatureCard
            icon="⬡"
            title="Module Federation"
            tag="Webpack 5 / Vite"
            desc="Each remote loads independently at runtime. The host fetches remoteEntry.js dynamically — no build-time coupling between frameworks."
            delay={0}
          />
          <FeatureCard
            icon="🔐"
            title="Shared Auth Singleton"
            tag="Framework-agnostic"
            desc="A single AuthStore instance is shared across all remotes via the Module Federation shared config. One logout event propagates everywhere instantly."
            delay={60}
          />
          <FeatureCard
            icon="◐"
            title="Role-Based UI"
            tag="JWT Claims"
            desc="User roles (admin, developer, viewer) are encoded in JWT claims. Each remote reads the same token and renders different UI based on capabilities."
            delay={120}
          />
          <FeatureCard
            icon="↺"
            title="Cross-Remote Logout"
            tag="EventEmitter"
            desc="AuthStore uses a pub/sub pattern. Any remote can call authStore.logout() and all other remotes react immediately — including auto-redirect."
            delay={180}
          />
          <FeatureCard
            icon="⟳"
            title="Token Expiry"
            tag="JWT TTL"
            desc="Tokens expire after 1 hour. A setTimeout in the store triggers automatic logout. Rehydration from localStorage on page reload with validation."
            delay={240}
          />
          <FeatureCard
            icon="⬟"
            title="Protected Routes"
            tag="Guard pattern"
            desc="The host shell checks auth state before rendering remotes. Unauthenticated users see the landing page. Each remote also guards its own content."
            delay={300}
          />
        </div>
      </section>

      {/* ── Architecture ── */}
      <section id="architecture" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>// AUTH_FLOW</span>
          <h2 className={styles.sectionTitle}>How auth state<br /><em>crosses framework boundaries</em></h2>
        </div>

        <div className={styles.flowDiagram}>
          {[
            { step: '01', title: 'User logs in', desc: 'Credentials validated against mock user DB. JWT created with role claims, stored in AuthStore + localStorage.', color: 'var(--accent)' },
            { step: '02', title: 'Token shared', desc: 'Module Federation marks auth-core as singleton. All remotes receive the SAME AuthStore instance — no re-fetching.', color: 'var(--blue)' },
            { step: '03', title: 'Remotes react', desc: 'Vue composable & Angular service subscribe to AuthStore. UI updates instantly when auth state changes.', color: 'var(--green)' },
            { step: '04', title: 'Role gates', desc: 'JWT payload contains role. Each remote uses getCaps(role) to show/hide features. Admin sees deploy buttons; viewer sees read-only.', color: 'var(--yellow)' },
            { step: '05', title: 'Logout broadcast', desc: 'authStore.logout() clears state and emits to all subscribers. Every remote redirects to landing within milliseconds.', color: 'var(--red)' },
          ].map((item, i) => (
            <div key={i} className={styles.flowStep}>
              <div className={styles.flowStepNum} style={{ color: item.color, borderColor: item.color + '44' }}>
                {item.step}
              </div>
              <div className={styles.flowStepBody}>
                <h3 className={styles.flowStepTitle}>{item.title}</h3>
                <p className={styles.flowStepDesc}>{item.desc}</p>
              </div>
              {i < 4 && <div className={styles.flowArrow}>→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── Demo Accounts ── */}
      <section id="access" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>// DEMO_ACCOUNTS</span>
          <h2 className={styles.sectionTitle}>Three roles.<br /><em>Three different dashboards.</em></h2>
          <p className={styles.sectionSub}>
            Each account shows a different view of the same micro-frontend — demonstrating role-based UI across framework boundaries.
          </p>
        </div>

        <div className={styles.usersGrid}>
          {DEMO_USERS.map(u => (
            <div key={u.username} className={styles.userCard} style={{ '--role-color': u.color }}>
              <div className={styles.userCardHeader}>
                <div className={styles.userAvatar} style={{ color: u.color, borderColor: u.color + '44', background: u.color + '12' }}>
                  {u.name.split(' ').map(w => w[0]).join('')}
                </div>
                <div>
                  <div className={styles.userName}>{u.name}</div>
                  <div className={styles.userRole} style={{ color: u.color }}>{u.role}</div>
                </div>
              </div>

              <div className={styles.userCreds}>
                <div className={styles.credRow}>
                  <span className={styles.credLabel}>username</span>
                  <code className={styles.credValue}>{u.username}</code>
                </div>
                <div className={styles.credRow}>
                  <span className={styles.credLabel}>password</span>
                  <code className={styles.credValue}>{u.password}</code>
                </div>
              </div>

              <ul className={styles.capsList}>
                {u.caps.map((c, i) => (
                  <li key={i} className={styles.capsItem}>
                    <span className={styles.capsCheck} style={{ color: u.color }}>✓</span>
                    {c}
                  </li>
                ))}
              </ul>

              <button
                className={styles.loginAsBtn}
                style={{ '--role-color': u.color }}
                onClick={() => handleDemoLogin(u)}
              >
                Login as {u.name.split(' ')[0]} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <polygon points="10,1 19,6 19,14 10,19 1,14 1,6"
                stroke="var(--accent)" strokeWidth="1.5" fill="var(--accent-glow)"/>
              <circle cx="10" cy="10" r="2.5" fill="var(--accent)"/>
            </svg>
            <span>DevPulse</span>
            <span className={styles.footerVersion}>v0.1.0-mvp</span>
          </div>
          <p className={styles.footerNote}>
            Built with Module Federation · React 18 · Vue 3 · Angular 17 · JWT Auth
          </p>
        </div>
      </footer>

      {/* ── Login Modal ── */}
      {showLogin && (
        <LoginModal
          prefill={selectedUser}
          onClose={() => { setShowLogin(false); setSelectedUser(null) }}
          onSuccess={onLogin}
        />
      )}
    </div>
  )
}
