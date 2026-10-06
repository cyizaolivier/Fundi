import { useRef, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { useI18n } from '../i18n/I18nContext';
import PasswordField from '../components/PasswordField';

export default function Register() {
  const [role, setRole] = useState('client');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const confirmRef = useRef(null);
  const { register } = useSession();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  // Plugs the password-match check into the browser's own HTML5 validation
  // flow via setCustomValidity, instead of a separate JS-rendered error -
  // same technique as the plain-JS version of this form.
  function checkPasswordsMatch(confirmValue) {
    if (confirmRef.current) {
      confirmRef.current.setCustomValidity(confirmValue !== password ? 'Passwords do not match.' : '');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const newUser = {
      username: form['reg-username'].value.trim(),
      password,
      role,
      name: form['reg-name'].value.trim(),
      phone: form['reg-phone'].value.trim(),
      email: form['reg-email'].value.trim(),
    };
    if (role === 'fundi') {
      newUser.trade = form['reg-trade'].value;
      newUser.location = form['reg-location'].value.trim();
    }

    setBusy(true);
    const result = await register(newUser);
    setBusy(false);
    if (!result.ok) {
      setStatus({ ok: false, message: result.message });
      return;
    }
    setStatus({ ok: true, message: `Account created. Welcome, ${newUser.name}. Redirecting...` });
    const target = role === 'client' && location.state?.fundiUsername
      ? `/dashboard/client?fundi=${encodeURIComponent(location.state.fundiUsername)}`
      : role === 'client' ? '/dashboard/client' : '/dashboard/fundi';
    navigate(target);
  }

  return (
    <main style={{ maxWidth: 460 }}>
      <form className="card" onSubmit={handleSubmit}>
        <h2>{t('reg_h2')}</h2>
        <p className="muted" style={{ marginBottom: '0.6rem' }}>{t('reg_choose')}</p>
        <div className="role-toggle">
          <button type="button" className={role === 'client' ? 'active' : undefined} onClick={() => setRole('client')}>{t('login_client')}</button>
          <button type="button" className={role === 'fundi' ? 'active' : undefined} onClick={() => setRole('fundi')}>{t('login_fundi')}</button>
        </div>

        <div className="form-field">
          <label htmlFor="reg-name">{t('reg_name')}</label>
          <input type="text" id="reg-name" name="reg-name" minLength={2} required />
        </div>

        <div className="form-field">
          <label htmlFor="reg-username">{t('reg_username')}</label>
          <input type="text" id="reg-username" name="reg-username" minLength={3} pattern="[A-Za-z0-9_]+" title="Letters, numbers, and underscores only" required />
        </div>

        <div className="form-field">
          <label htmlFor="reg-phone">{t('reg_phone')}</label>
          <input type="tel" id="reg-phone" name="reg-phone" placeholder="0788123456" pattern="(\+?250|0)?7[0-9]{8}" title="Enter a Rwandan number, e.g. 0788123456" required />
        </div>

        <div className="form-field">
          <label htmlFor="reg-email">{t('reg_email')}</label>
          <input type="email" id="reg-email" name="reg-email" autoComplete="email" required />
        </div>

        <div className="form-field">
          <label htmlFor="reg-password">{t('reg_password')}</label>
          <PasswordField id="reg-password" minLength={6} required value={password} autoComplete="new-password"
            onChange={(e) => { setPassword(e.target.value); if (confirmRef.current) checkPasswordsMatch(confirmRef.current.value); }} />
        </div>

        <div className="form-field">
          <label htmlFor="reg-confirm">{t('reg_confirm')}</label>
          <PasswordField id="reg-confirm" minLength={6} required ref={confirmRef} autoComplete="new-password"
            value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); checkPasswordsMatch(e.target.value); }} />
        </div>

        {role === 'fundi' && (
          <div>
            <div className="form-field">
              <label htmlFor="reg-trade">{t('reg_trade')}</label>
              <select id="reg-trade" name="reg-trade" defaultValue="Electrician">
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Tailor">Tailor</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="reg-location">{t('reg_location')}</label>
              <input type="text" id="reg-location" name="reg-location" placeholder="e.g. Kimironko, Kigali" />
            </div>
          </div>
        )}

        <button type="submit" disabled={busy}>{busy ? t('reg_submitting') : t('reg_submit')}</button>
        {status && <div className={`status-msg ${status.ok ? 'success' : 'error'}`}>{status.message}</div>}
        <p className="muted" style={{ marginTop: '1rem' }}>{t('reg_have_account')} <Link to="/login" state={location.state}>{t('reg_login_here')}</Link>.</p>
      </form>
    </main>
  );
}
