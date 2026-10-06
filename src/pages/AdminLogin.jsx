import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import PasswordField from '../components/PasswordField';

// Admin credentials are checked separately from regular user accounts.
export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const { login } = useSession();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    const result = await login(username.trim(), password, 'admin');
    setBusy(false);
    if (!result.ok) { setStatus({ ok: false, message: result.message }); return; }
    navigate('/admin/overview');
  }

  return (
    <main style={{ maxWidth: 380 }}>
      <form className="card" onSubmit={handleSubmit}>
        <h2>Admin login</h2>
        <p className="muted" style={{ marginBottom: '0.6rem' }}>Restricted - site administrators only.</p>

        <div className="form-field">
          <label htmlFor="admin-username">Username</label>
          <input type="text" id="admin-username" required value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

        <div className="form-field">
          <label htmlFor="admin-password">Password</label>
          <PasswordField id="admin-password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>

        <button type="submit" disabled={busy}>{busy ? 'Signing in...' : 'Login'}</button>
        {status && <div className={`status-msg ${status.ok ? 'success' : 'error'}`}>{status.message}</div>}
      </form>
    </main>
  );
}
