import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { useI18n } from '../i18n/I18nContext';
import { getFundis, loadAllBookings, addBooking, setBookingStatus, getReviews, addReview, markClientBookingsSeen } from '../lib/store';
import StatusPill from '../components/StatusPill';
import RatingInput from '../components/RatingInput';
import ContactDetailsForm from '../components/ContactDetailsForm';
import BookingContact from '../components/BookingContact';

function ReviewForm({ booking, onDone }) {
  const { session } = useSession();
  const { t } = useI18n();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await addReview({ bookingId: booking.id, clientUsername: session.username, fundiUsername: booking.fundiUsername, rating, comment: comment.trim() });
      if (!result.ok) { setError(result.message); return; }
      await onDone();
    } catch {
      setError(t('dashboard_review_error'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="review-form" onSubmit={submit}>
      <p className="muted" style={{ marginBottom: '0.4rem' }}>{t('dashboard_rate_fundi')}</p>
      <RatingInput value={rating} onChange={setRating} />
      <textarea rows={2} placeholder={t('dashboard_optional_comment')} value={comment} onChange={(e) => setComment(e.target.value)} style={{ marginTop: '0.5rem' }} />
      <button type="submit" disabled={busy} style={{ marginTop: '0.5rem' }}>{busy ? t('dashboard_saving_review') : t('dashboard_submit_review')}</button>
      {error && <div className="status-msg error" role="alert" style={{ marginTop: '0.5rem' }}>{error}</div>}
    </form>
  );
}

export default function DashboardClient() {
  const { session } = useSession();
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const [fundis, setFundis] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const [fundiUsername, setFundiUsername] = useState(searchParams.get('fundi') || '');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [today] = useState(() => new Date().toISOString().split('T')[0]);

  const loadDashboard = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
      setLoadError(false);
    }
    try {
      const [list, all, myReviews] = await Promise.all([getFundis(), loadAllBookings(session.username), getReviews()]);
      setFundis(list);
      setBookings(all.filter((b) => b.clientUsername === session.username).reverse());
      markClientBookingsSeen(all, session.username);
      setReviewedIds(new Set(myReviews.filter((r) => r.clientUsername === session.username).map((r) => r.bookingId)));
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [session.username]);

  async function refreshBookings() {
    try {
      const [all, myReviews] = await Promise.all([loadAllBookings(session.username), getReviews()]);
      setBookings(all.filter((b) => b.clientUsername === session.username).reverse());
      markClientBookingsSeen(all, session.username);
      setReviewedIds(new Set(myReviews.filter((r) => r.clientUsername === session.username).map((r) => r.bookingId)));
    } catch {
      setLoadError(true);
    }
  }

  useEffect(() => {
    let cancelled = false;
    Promise.all([getFundis(), loadAllBookings(session.username), getReviews()]).then(([list, all, myReviews]) => {
      if (cancelled) return;
      setFundis(list);
      setBookings(all.filter((b) => b.clientUsername === session.username).reverse());
      markClientBookingsSeen(all, session.username);
      setReviewedIds(new Set(myReviews.filter((r) => r.clientUsername === session.username).map((r) => r.bookingId)));
    }).catch(() => {
      if (!cancelled) setLoadError(true);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [session.username]);

  async function handleSubmit(e) {
    e.preventDefault();
    const fundi = fundis.find((f) => f.username === fundiUsername);
    setBusy(true);
    setStatus(null);
    try {
      const result = await addBooking({
        clientUsername: session.username, fundiUsername, category: fundi ? fundi.trade : 'General', date, description,
      });
      setStatus({ ok: result.ok, message: result.ok ? t('dashboard_request_sent') : (result.message || t('dashboard_request_error')) });
      if (result.ok) {
        setFundiUsername(''); setDate(''); setDescription('');
        await refreshBookings();
      }
    } catch {
      setStatus({ ok: false, message: t('dashboard_request_error') });
    } finally {
      setBusy(false);
    }
  }

  async function cancel(id) {
    setStatus(null);
    try {
      const result = await setBookingStatus(id, 'cancelled', session.username);
      if (!result.ok) {
        setStatus({ ok: false, message: result.message || t('dashboard_request_error') });
        return;
      }
      await refreshBookings();
      setStatus({ ok: true, message: t('dashboard_booking_success') });
    } catch {
      setStatus({ ok: false, message: t('dashboard_request_error') });
    }
  }

  if (loading) return <main><p className="muted" role="status">{t('loading')}</p></main>;
  if (loadError) return (
    <main>
      <div className="status-msg error" role="alert">{t('dashboard_load_error')}</div>
      <button className="retry-button" type="button" onClick={loadDashboard}>{t('retry')}</button>
    </main>
  );

  return (
    <main>
      <section className="dash-head">
        <h1>{t('dashboard_welcome').replace('{name}', session.name)}</h1>
        <p>{t('dashboard_client_intro')}</p>
      </section>

      <form className="card" onSubmit={handleSubmit}>
        <h2>{t('dashboard_request_booking')}</h2>

        <div className="form-field">
          <label htmlFor="b-fundi">{t('dashboard_choose_fundi')}</label>
          <select id="b-fundi" required value={fundiUsername} onChange={(e) => setFundiUsername(e.target.value)}>
            <option value="">{t('dashboard_select_fundi')}</option>
            {fundis.map((f) => (
              <option value={f.username} key={f.username}>{f.name} - {f.trade}{f.location ? ` (${f.location})` : ''}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="b-date">{t('dashboard_preferred_date')}</label>
          <input type="date" id="b-date" required min={today} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div className="form-field">
          <label htmlFor="b-description">{t('dashboard_describe_job')}</label>
          <textarea id="b-description" rows={4} minLength={10} required value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <button type="submit" disabled={busy}>{busy ? t('dashboard_sending') : t('dashboard_send_request')}</button>
        {status && <div className={`status-msg ${status.ok ? 'success' : 'error'}`} role={status.ok ? 'status' : 'alert'}>{status.message}</div>}
      </form>

      <h2 className="section-title">{t('dashboard_my_bookings')}</h2>
      <div>
        {bookings.length === 0 ? (
          <p className="muted" style={{ padding: '1.2rem 0' }}>{t('dashboard_no_bookings')}</p>
        ) : bookings.map((b) => {
          const f = fundis.find((x) => x.username === b.fundiUsername);
          return (
            <div className="booking-item" key={b.id}>
              <div style={{ flex: 1 }}>
                <strong>{b.category}</strong> {t('booking_with')} {f ? f.name : b.fundiUsername} {t('booking_on')} {b.date}
                <p className="muted" style={{ marginTop: 2 }}>{b.description}</p>
                {b.status === 'accepted' && <BookingContact contact={b.otherContact} />}
                {b.status === 'completed' && !reviewedIds.has(b.id) && (
                  <ReviewForm booking={b} onDone={refreshBookings} />
                )}
                {b.status === 'completed' && reviewedIds.has(b.id) && (
                  <p className="muted" style={{ marginTop: '0.4rem' }}>{t('dashboard_review_thanks')}</p>
                )}
              </div>
              <div className="booking-item-actions">
                <StatusPill status={b.status} />
                {b.status === 'pending' && (
                  <button type="button" className="decline-btn" onClick={() => cancel(b.id)}>{t('dashboard_cancel')}</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <ContactDetailsForm />
    </main>
  );
}
