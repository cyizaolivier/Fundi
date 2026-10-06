import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { useI18n } from '../i18n/I18nContext';
import PasswordField from '../components/PasswordField';

export default function Login() {
  const [role, setRole] = useState('client');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const { login } = useSession();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    // HTML5 validation (required, minlength) has already passed.
    setBusy(true);
    const result = await login(username.trim(), password, role);
    setBusy(false);
    if (!result.ok) {
      setStatus({ ok: false, message: result.message });
      return;
    }
    setStatus({ ok: true, message: `Welcome back, ${result.user.name}. Opening your dashboard...` });
    const target = role === 'client' && location.state?.fundiUsername
      ? `/dashboard/client?fundi=${encodeURIComponent(location.state.fundiUsername)}`
      : role === 'client' ? '/dashboard/client' : '/dashboard/fundi';
    navigate(target);
  }

  return (
    <main style={{ maxWidth: 420 }}>
      <form className="card" onSubmit={handleSubmit}>
        <h2>{t('login_h2')}</h2>
        <p className="muted" style={{ marginBottom: '0.6rem' }}>{t('login_choose')}</p>
        <div className="role-toggle">
          <button type="button" className={role === 'client' ? 'active' : undefined} onClick={() => setRole('client')}>{t('login_client')}</button>
          <button type="button" className={role === 'fundi' ? 'active' : undefined} onClick={() => setRole('fundi')}>{t('login_fundi')}</button>
        </div>

        <div className="form-field">
          <label htmlFor="login-username">{t('login_username')}</label>
          <input type="text" id="login-username" minLength={3} required value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

        <div className="form-field">
          <label htmlFor="login-password">{t('login_password')}</label>
          <PasswordField id="login-password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>

        <button type="submit" disabled={busy}>{busy ? t('login_submitting') : t('login_submit')}</button>
        {status && <div className={`status-msg ${status.ok ? 'success' : 'error'}`}>{status.message}</div>}
        <p className="muted" style={{ marginTop: '1rem' }}>{t('login_demo')}</p>
        <p className="muted">{t('login_no_account')} <Link to="/register" state={location.state}>{t('login_register_here')}</Link>.</p>
      </form>
    </main>
  );
}
