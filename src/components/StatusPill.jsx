import { useI18n } from '../i18n/I18nContext';

export default function StatusPill({ status }) {
  const { t } = useI18n();
  return <span className={`status-pill ${status}`}>{t(`status_${status}`)}</span>;
}
