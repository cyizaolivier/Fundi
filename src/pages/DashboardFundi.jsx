import { useCallback, useEffect, useState } from 'react';
import { useSession } from '../context/SessionContext';
import { useI18n } from '../i18n/I18nContext';
import { getFundis, loadAllBookings, setBookingStatus, saveProfile } from '../lib/store';
import StatusPill from '../components/StatusPill';
import StarRating from '../components/StarRating';
import ContactDetailsForm from '../components/ContactDetailsForm';
import BookingContact from '../components/BookingContact';

export default function DashboardFundi() {
  const { session } = useSession();
  const { t } = useI18n();
  const [bookings, setBookings] = useState([]);
  const [myRating, setMyRating] = useState(null);
  const [rate, setRate] = useState('');
  const [availability, setAvailability] = useState('');
  const [bio, setBio] = useState('');
  const [profileStatus, setProfileStatus] = useState(null);
  const [actionStatus, setActionStatus] = useState(null);
  const [profileBusy, setProfileBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadDashboard = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
      setLoadError(false);
    }
    try {
      const [list, all] = await Promise.all([getFundis(), loadAllBookings(session.username)]);
      const me = list.find((f) => f.username === session.username);
      setBookings(all.filter((b) => b.fundiUsername === session.username).reverse());
      setMyRating(me || null);
      setRate(me?.rate ? String(me.rate) : '');
      setAvailability(me?.availability || '');
      setBio(me?.bio || '');
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [session.username]);

  async function refreshBookings() {
    try {
      const all = await loadAllBookings(session.username);
      setBookings(all.filter((b) => b.fundiUsername === session.username).reverse());
    } catch {
      setLoadError(true);
    }
  }

  useEffect(() => {
    let cancelled = false;
    Promise.all([getFundis(), loadAllBookings(session.username)]).then(([list, all]) => {
      if (cancelled) return;
      const me = list.find((f) => f.username === session.username);
      setBookings(all.filter((b) => b.fundiUsername === session.username).reverse());
      setMyRating(me || null);
      setRate(me?.rate ? String(me.rate) : '');
      setAvailability(me?.availability || '');
      setBio(me?.bio || '');
    }).catch(() => {
      if (!cancelled) setLoadError(true);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [session.username]);

  async function act(id, status) {
    setActionStatus(null);
    try {
      const result = await setBookingStatus(id, status, session.username);
      if (!result.ok) {
        setActionStatus({ ok: false, message: result.message || t('dashboard_request_error') });
        return;
      }
      await refreshBookings();
      setActionStatus({ ok: true, message: t('dashboard_booking_success') });
    } catch {
      setActionStatus({ ok: false, message: t('dashboard_request_error') });
    }
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileBusy(true);
    setProfileStatus(null);
    try {
      const result = await saveProfile(session.username, { rate: Number(rate), availability, bio });
      setProfileStatus({ ok: result.ok, message: result.ok ? t('dashboard_profile_saved') : (result.message || t('dashboard_profile_error')) });
      if (result.ok && myRating) setMyRating({ ...myRating, rate: Number(rate), availability, bio });
    } catch {
      setProfileStatus({ ok: false, message: t('dashboard_profile_error') });
    } finally {
      setProfileBusy(false);
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
        <p>{t('dashboard_fundi_intro')}</p>
        {myRating && <StarRating rating={myRating.rating} count={myRating.reviewCount} labelReview={t('fundis_review')} labelReviews={t('fundis_reviews')} />}
      </section>

      <h2 className="section-title">{t('dashboard_incoming')}</h2>
      {actionStatus && <div className={`status-msg ${actionStatus.ok ? 'success' : 'error'}`} role={actionStatus.ok ? 'status' : 'alert'}>{actionStatus.message}</div>}
      <div>
        {bookings.length === 0 ? (
          <p className="muted" style={{ padding: '1.2rem 0' }}>{t('dashboard_no_requests')}</p>
        ) : bookings.map((b) => (
          <div className="booking-item" key={b.id}>
            <div>
              <strong>{b.category}</strong> {t('booking_requested_for')} {b.date}
              <p className="muted" style={{ marginTop: 2 }}>{b.description}</p>
              {b.status === 'accepted' && <BookingContact contact={b.otherContact} />}
            </div>
            <div className="booking-item-actions">
              <StatusPill status={b.status} />
              {b.status === 'pending' && (
                <span className="booking-actions">
                  <button type="button" onClick={() => act(b.id, 'accepted')}>{t('dashboard_accept')}</button>
                  <button type="button" className="decline-btn" onClick={() => act(b.id, 'declined')}>{t('dashboard_decline')}</button>
                </span>
              )}
              {b.status === 'accepted' && (
                <span className="booking-actions">
                  <button type="button" onClick={() => act(b.id, 'completed')}>{t('dashboard_complete')}</button>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <ContactDetailsForm />

      <form className="card" style={{ marginTop: '1.8rem' }} onSubmit={handleProfileSubmit}>
        <h2>{t('dashboard_profile')}</h2>
        {!myRating && <p className="muted">{t('dashboard_profile_complete')}</p>}

        <div className="form-field">
          <label htmlFor="p-rate">{t('dashboard_rate')}</label>
          <input type="number" id="p-rate" min={500} step={100} required value={rate} onChange={(e) => setRate(e.target.value)} />
        </div>

        <div className="form-field">
          <label htmlFor="p-availability">{t('dashboard_availability')}</label>
          <select id="p-availability" required value={availability} onChange={(e) => setAvailability(e.target.value)}>
            <option value="">{t('dashboard_select_availability')}</option>
            <option value="Available today">{t('dashboard_available_today')}</option>
            <option value="Available this week">{t('dashboard_available_week')}</option>
            <option value="Fully booked">{t('dashboard_fully_booked')}</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="p-bio">{t('dashboard_bio')}</label>
          <textarea id="p-bio" rows={4} minLength={10} required value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>

        <button type="submit" disabled={profileBusy}>{profileBusy ? t('dashboard_saving') : t('dashboard_save_profile')}</button>
        {profileStatus && <div className={`status-msg ${profileStatus.ok ? 'success' : 'error'}`} role={profileStatus.ok ? 'status' : 'alert'}>{profileStatus.message}</div>}
      </form>
    </main>
  );
}
