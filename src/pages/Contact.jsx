import { useState } from 'react';

export default function Contact() {
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // HTML5 validation (required, minlength, type="email") has already
    // passed by the time this runs - no manual field checks needed here.
    const name = e.target.elements['c-name'].value.trim();
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setStatus({ ok: true, message: `Thanks ${name}, your message has been received. We will reply by email shortly.` });
      e.target.reset();
    }, 400);
  }

  return (
    <main>
      <section className="card">
        <h2>Contact information</h2>
        <address>KG 7 Ave, Kacyiru, Kigali, Rwanda</address>
        <p>Telephone: <a href="tel:+250788123456">+250 788 123 456</a></p>
        <p>Email: <a href="mailto:hello@fundi.rw">hello@fundi.rw</a></p>
      </section>

      <form className="card" onSubmit={handleSubmit}>
        <h2>Send us a message</h2>

        <div className="form-field">
          <label htmlFor="c-name">Full name</label>
          <input type="text" id="c-name" name="c-name" minLength={2} required />
        </div>

        <div className="form-field">
          <label htmlFor="c-email">Email address</label>
          <input type="email" id="c-email" name="c-email" required />
        </div>

        <div className="form-field">
          <label htmlFor="c-message">Message</label>
          <textarea id="c-message" name="c-message" rows={5} minLength={10} required />
        </div>

        <button type="submit" disabled={busy}>{busy ? 'Sending...' : 'Send message'}</button>
        {status && <div className={`status-msg ${status.ok ? 'success' : 'error'}`}>{status.message}</div>}
      </form>
    </main>
  );
}
