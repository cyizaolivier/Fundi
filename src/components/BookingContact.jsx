import { useI18n } from '../i18n/I18nContext';

export default function BookingContact({ contact }) {
  const { t } = useI18n();
  const phone = contact?.phone;
  const email = contact?.email;

  return (
    <section className="booking-contact" aria-label={t('booking_contact_title')}>
      <h3>{t('booking_contact_title')} {contact?.name || ''}</h3>
      {phone ? <p><strong>{t('contact_phone')}:</strong> <a href={`tel:${phone}`}>{phone}</a></p> : <p className="muted">{t('contact_phone_missing')}</p>}
      {email ? <p><strong>{t('contact_email')}:</strong> <a href={`mailto:${email}`}>{email}</a></p> : <p className="muted">{t('contact_email_missing')}</p>}
    </section>
  );
}
