import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useI18n } from '../i18n/I18nContext';
import { useSession } from '../context/SessionContext';

export default function Footer() {
  const { t } = useI18n();
  const { session } = useSession();
  return (
    <footer>
      <div className="footer-row">
        <Link to="/" className="logo">
          <Logo />
        </Link>
        <p>
          <a href="server-time.php">{t('footer_servertime')}</a>
          {' '}&nbsp;&middot;&nbsp; <Link to="/admin" className="admin-portal-link">Admin Portal</Link>
          {session?.role === 'admin' && <> &nbsp;&middot;&nbsp; <Link to="/admin/overview">{t('footer_admin')}</Link></>}
          {' '}&nbsp;&middot;&nbsp; &copy; 2026 Fundi. Kigali, Rwanda.
        </p>
      </div>
    </footer>
  );
}
