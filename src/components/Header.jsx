import { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import Logo from './Logo';
import { useSession } from '../context/SessionContext';
import { useI18n } from '../i18n/I18nContext';
import { loadAllBookings, pendingCountForFundi, unseenCountForClient } from '../lib/store';

export default function Header() {
  const { session, logout } = useSession();
  const { t, lang, toggleLang } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [badge, setBadge] = useState(0);

  useEffect(() => {
    if (!session || session.role === 'admin') { setBadge(0); return; }
    let cancelled = false;
    loadAllBookings().then((bookings) => {
      if (cancelled) return;
      setBadge(session.role === 'fundi'
        ? pendingCountForFundi(bookings, session.username)
        : unseenCountForClient(bookings, session.username));
    });
    return () => { cancelled = true; };
  }, [session]);

  const activeCls = ({ isActive }) => (isActive ? 'active' : undefined);
  const dashboardPath = session?.role === 'admin' ? '/admin/overview' : session?.role === 'client' ? '/dashboard/client' : '/dashboard/fundi';
  const dashboardLabel = session?.role === 'admin' ? 'Admin' : t('nav_dashboard');

  return (
    <header>
      <div className="brand-row">
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <Logo />
        </Link>

        <button className="nav-toggle" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
          <span /><span /><span />
        </button>

        <nav aria-label="Main navigation" className={menuOpen ? 'open' : undefined}>
          <ul onClick={() => setMenuOpen(false)}>
            <li><NavLink to="/" end className={activeCls}>{t('nav_home')}</NavLink></li>
            <li><NavLink to="/about" className={activeCls}>{t('nav_about')}</NavLink></li>
            <li><NavLink to="/contact" className={activeCls}>{t('nav_contact')}</NavLink></li>
            {!session && <li><NavLink to="/register" className={activeCls}>{t('nav_become')}</NavLink></li>}
            <li className="nav-lang">
              <button type="button" className="lang-toggle" onClick={toggleLang} aria-label="Change language">
                {lang === 'en' ? 'RW' : 'EN'}
              </button>
            </li>
            <li>
              {session ? (
                <>
                  <NavLink to={dashboardPath} className="nav-dashboard">
                    {dashboardLabel}
                    {badge > 0 && <span className="badge-count">{badge}</span>}
                  </NavLink>
                  {' '}
                  <a href="#logout" onClick={(e) => { e.preventDefault(); logout(); }}>{t('nav_logout')}</a>
                </>
              ) : (
                <NavLink to="/login" className={activeCls}>{t('nav_login')}</NavLink>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
