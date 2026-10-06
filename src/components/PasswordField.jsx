import { forwardRef, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';

// A password <input> with a show/hide toggle. Takes the same props you'd
// give a plain <input>, minus `type` (always starts as "password").
// Forwards its ref to the underlying <input> so callers can still reach
// the native element (e.g. to call setCustomValidity()).
const PasswordField = forwardRef(function PasswordField(
  { id, value, onChange, minLength, required, autoComplete }, ref
) {
  const [shown, setShown] = useState(false);
  const { t } = useI18n();
  return (
    <div className="password-field">
      <input
        ref={ref}
        type={shown ? 'text' : 'password'}
        id={id}
        value={value}
        onChange={onChange}
        minLength={minLength}
        required={required}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? t('hide_password') : t('show_password')}
      >
        {shown ? '\u{1F648}' : '\u{1F441}\uFE0F'}
      </button>
    </div>
  );
});

export default PasswordField;
