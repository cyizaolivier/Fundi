import { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { useI18n } from '../i18n/I18nContext';
import { saveContactDetails } from '../lib/store';

export default function ContactDetailsForm() {
  const { session } = useSession();
  const { t } = useI18n();
  const [phone, setPhone] = useState(session.phone || '');
  const [email, setEmail] = useState(session.email || '');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const result = await saveContactDetails(session.username, { phone: phone.trim(), email: email.trim() });
      setStatus({
        ok: result.ok,
        message: result.ok ? t('contact_saved') : (result.message || t('contact_save_error')),
      });
    } catch {
      setStatus({ ok: false, message: t('contact_save_error') });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card contact-details-form" onSubmit={submit}>
      <h2>{t('contact_details_title')}</h2>
      <p className="muted">{t('contact_details_hint')}</p>
      <div className="form-field">
        <label htmlFor="contact-phone">{t('contact_phone')}</label>
        <input id="contact-phone" type="tel" required pattern="(\+?250|0)?7[0-9]{8}" title="Enter a Rwandan number, e.g. 0788123456" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="form-field">
        <label htmlFor="contact-email">{t('contact_email')}</label>
        <input id="contact-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <button type="submit" disabled={busy}>{busy ? t('contact_saving') : t('contact_save')}</button>
      {status && <div className={`status-msg ${status.ok ? 'success' : 'error'}`} role={status.ok ? 'status' : 'alert'}>{status.message}</div>}
    </form>
  );
}
