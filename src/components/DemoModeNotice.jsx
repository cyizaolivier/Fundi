import { useEffect, useState } from 'react';
import { isBackendAvailable } from '../lib/store';
import { useI18n } from '../i18n/I18nContext';

export default function DemoModeNotice() {
  const [offline, setOffline] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    let cancelled = false;
    isBackendAvailable().then((available) => {
      if (!cancelled) setOffline(!available);
    });
    return () => { cancelled = true; };
  }, []);

  if (!offline) return null;
  return <aside className="demo-notice" role="status">{t('demo_notice')}</aside>;
}
