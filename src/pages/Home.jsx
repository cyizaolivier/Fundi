import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFundis, priceLabel } from '../lib/store';
import { useSession } from '../context/SessionContext';
import { useI18n } from '../i18n/I18nContext';
import StatusPill from '../components/StatusPill';
import StarRating from '../components/StarRating';
import Avatar from '../components/Avatar';

export default function Home() {
  const [fundis, setFundis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [term, setTerm] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const { session } = useSession();
  const { t } = useI18n();

  const loadFundis = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
      setLoadError(false);
    }
    try {
      setFundis(await getFundis());
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getFundis().then((list) => {
      if (!cancelled) setFundis(list);
    }).catch(() => {
      if (!cancelled) setLoadError(true);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const categories = useMemo(() => [...new Set(fundis.map((f) => f.trade))].sort(), [fundis]);
  const locations = useMemo(() => [...new Set(fundis.map((f) => f.location).filter(Boolean))].sort(), [fundis]);

  const filtered = fundis.filter((f) => {
    if (query && !`${f.trade} ${f.location} ${f.name}`.toLowerCase().includes(query.toLowerCase())) return false;
    if (category && f.trade !== category) return false;
    if (location && f.location !== location) return false;
    return true;
  });

  const bookHref = session && session.role === 'client' ? '/dashboard/client' : '/login';

  return (
    <>
      <div className="wrap">
        <section className="hero">
          <div>
            <h1>{t('hero_h1_1')}<span>{t('hero_h1_2')}</span>{t('hero_h1_3')}</h1>
            <p className="lede">{t('hero_lede')}</p>
            <form className="search-row" onSubmit={(e) => { e.preventDefault(); setQuery(term); document.getElementById('fundis').scrollIntoView({ behavior: 'smooth' }); }}>
              <label htmlFor="search-input" className="hidden">Search by trade or area</label>
              <input type="search" id="search-input" placeholder={t('hero_search_ph')} value={term} onChange={(e) => setTerm(e.target.value)} />
              <button type="submit">{t('hero_search_btn')}</button>
            </form>
          </div>
          <div className="preview" aria-hidden="true">
            <div className="preview-head">{t('hero_preview_head')}</div>
            <div className="preview-row">
              <div><p className="preview-trade">Plumber</p><p className="preview-meta">Alice Uwase &middot; Kimironko</p></div>
              <StatusPill status="accepted" />
            </div>
            <div className="preview-row">
              <div><p className="preview-trade">Electrician</p><p className="preview-meta">Jean Paul Habimana &middot; Kacyiru</p></div>
              <StatusPill status="pending" />
            </div>
            <div className="preview-row">
              <div><p className="preview-trade">Tailor</p><p className="preview-meta">Eric Nshimiyimana &middot; Nyamirambo</p></div>
              <StatusPill status="pending" />
            </div>
          </div>
        </section>
      </div>

      <section className="band alt" id="fundis">
        <div className="wrap">
          <div className="band-head">
            <h2>{t('fundis_h2')}</h2>
            <p>{t('fundis_sub')}</p>
          </div>

          <div className="chip-row" role="group" aria-label="Filter by trade">
            <button type="button" className={category === '' ? 'chip active' : 'chip'} onClick={() => setCategory('')}>{t('fundis_all')}</button>
            {categories.map((c) => (
              <button type="button" key={c} className={category === c ? 'chip active' : 'chip'} onClick={() => setCategory((cur) => (cur === c ? '' : c))}>{c}</button>
            ))}
            {locations.length > 1 && (
              <select className="location-filter" value={location} onChange={(e) => setLocation(e.target.value)} aria-label="Filter by area">
                <option value="">{t('fundis_all_locations')}</option>
                {locations.map((loc) => <option value={loc} key={loc}>{loc}</option>)}
              </select>
            )}
          </div>

          <div className="fundi-grid">
            {loading ? (
              <p className="empty" role="status">{t('loading')}</p>
            ) : loadError ? (
              <div className="empty" role="alert">
                <p>{t('fundis_loading_error')}</p>
                <button className="retry-button" type="button" onClick={loadFundis}>{t('retry')}</button>
              </div>
            ) : filtered.length === 0 ? (
              <p className="empty">{t('fundis_empty')}</p>
            ) : filtered.map((f) => (
              <article className="fundi-item" key={f.username}>
                <div className="fundi-item-head">
                  <Avatar name={f.name} />
                  <div>
                    <Link className="fundi-profile-link" to={`/fundis/${encodeURIComponent(f.username)}`}><h3>{f.trade}</h3></Link>
                    <p className="who">{f.name}{f.location ? ` \u00b7 ${f.location}` : ''}</p>
                  </div>
                </div>
                <StarRating rating={f.rating} count={f.reviewCount} labelReview={t('fundis_review')} labelReviews={t('fundis_reviews')} />
                <p className="bio">
                  {f.bio || t('fundis_new')}
                  {f.availability && <span className="avail">{f.availability}</span>}
                </p>
                <div className="fundi-foot">
                  <span className="price">{priceLabel(f) ? <>{priceLabel(f)} <small>{f.rateUnit}</small></> : <small>{t('fundis_rate_on_request')}</small>}</span>
                  <span className="fundi-links">
                    <Link className="book-link" to={`/fundis/${encodeURIComponent(f.username)}`}>{t('fundis_view_profile')}</Link>
                    <Link
                      className="book-link"
                      to={session?.role === 'client' ? `/dashboard/client?fundi=${encodeURIComponent(f.username)}` : bookHref}
                      state={!session || session.role !== 'client' ? { fundiUsername: f.username } : undefined}
                    >{t('fundis_book')} {f.name.split(' ')[0]} &rarr;</Link>
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <div className="band-head"><h2>{t('how_h2')}</h2></div>
          <div className="steps">
            <div className="step"><div className="step-num">1</div><h3>{t('how_1_h')}</h3><p>{t('how_1_t')}</p></div>
            <div className="step"><div className="step-num">2</div><h3>{t('how_2_h')}</h3><p>{t('how_2_t')}</p></div>
            <div className="step"><div className="step-num">3</div><h3>{t('how_3_h')}</h3><p>{t('how_3_t')}</p></div>
          </div>
        </div>
      </section>

      <section className="band dark">
        <div className="wrap cta">
          <div>
            <h2>{t('cta_h2')}</h2>
            <p>{t('cta_p')}</p>
          </div>
          <div className="btn-row">
            <Link className="btn" to="/register">{t('cta_join')}</Link>
            <Link className="btn on-dark-ghost" to="/login">{t('cta_login')}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
