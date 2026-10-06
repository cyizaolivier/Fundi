import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getFundis, getReviews, priceLabel } from '../lib/store';
import { useSession } from '../context/SessionContext';
import { useI18n } from '../i18n/I18nContext';
import Avatar from '../components/Avatar';
import StarRating from '../components/StarRating';

export default function FundiProfile() {
  const { username } = useParams();
  const location = useLocation();
  const { session } = useSession();
  const { t } = useI18n();
  const [fundi, setFundi] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadProfile() {
    setLoading(true);
    setError('');
    try {
      const [fundis, fundiReviews] = await Promise.all([getFundis(), getReviews(username)]);
      const found = fundis.find((item) => item.username === username);
      if (!found) {
        setFundi(null);
        setError('not-found');
      } else {
        setFundi(found);
        setReviews(fundiReviews);
      }
    } catch {
      setError('load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
    // The route username determines the profile being loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  if (loading) return <main><p className="muted" role="status">{t('loading')}</p></main>;
  if (error) return (
    <main>
      <div className="status-msg error" role="alert">{t(error === 'not-found' ? 'profile_not_found' : 'profile_load_error')}</div>
      {error === 'load' && <button className="retry-button" onClick={loadProfile}>{t('retry')}</button>}
      <p className="profile-back"><Link to="/">{t('profile_back')}</Link></p>
    </main>
  );

  const bookingPath = `/dashboard/client?fundi=${encodeURIComponent(fundi.username)}`;
  const bookingLink = session?.role === 'client'
    ? { to: bookingPath }
    : { to: '/login', state: { from: bookingPath, fundiUsername: fundi.username, returnTo: location.pathname } };

  return (
    <main>
      <Link className="profile-back" to="/">{t('profile_back')}</Link>
      <section className="profile-card">
        <div className="profile-heading">
          <Avatar name={fundi.name} />
          <div>
            <p className="eyebrow">{fundi.trade}</p>
            <h1>{fundi.name}</h1>
            {fundi.location && <p>{fundi.location}</p>}
            <StarRating rating={fundi.rating} count={fundi.reviewCount} labelReview={t('fundis_review')} labelReviews={t('fundis_reviews')} />
          </div>
        </div>
        <div className="profile-details">
          <h2>{t('profile_about')}</h2>
          <p>{fundi.bio || t('fundis_new')}</p>
          <div className="profile-facts">
            <p><strong>{t('profile_rate')}</strong> {priceLabel(fundi) || t('fundis_rate_on_request')} {priceLabel(fundi) && <small>{fundi.rateUnit}</small>}</p>
            <p><strong>{t('profile_availability')}</strong> {fundi.availability || t('profile_availability_unknown')}</p>
          </div>
          <Link className="btn" {...bookingLink}>{t('profile_book')} {fundi.name.split(' ')[0]}</Link>
        </div>
      </section>

      <section className="profile-reviews">
        <h2>{t('profile_reviews')} ({reviews.length})</h2>
        {reviews.length === 0 ? <p className="muted">{t('profile_no_reviews')}</p> : reviews.map((review) => (
          <article className="review-item" key={review.id}>
            <p className="review-rating" aria-label={`${review.rating} ${t('profile_stars')}`}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)} <span>{review.rating}/5</span></p>
            {review.comment && <p>{review.comment}</p>}
            <p className="muted">{review.clientUsername} · {review.date}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
