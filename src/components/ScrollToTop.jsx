import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router doesn't reset scroll position on navigation by default -
// without this, clicking a nav link halfway down the home page lands you
// halfway down the next page too.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname, hash]);
  return null;
}
