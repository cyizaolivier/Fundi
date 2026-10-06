# Fundi - React version

The same design and the same logic as the plain HTML/CSS/JS/PHP version of
Fundi (formerly called FundiLink), rebuilt as a React app (Vite + React Router). The PHP backend
(`api/`, `data/`) is unchanged - only the frontend moved to React.

## New since the first version
A round of UI and functionality improvements on top of the original port:

**UI**
- Star ratings and review counts on fundi cards (`StarRating`), computed live from `data/reviews.json`.
- Initials avatars (`Avatar`) with a deterministic color per person.
- Category filter chips + an area (location) dropdown on the home page, combined with the existing text search.
- Show/hide toggle on every password field (`PasswordField`).
- Buttons show "Sending...", "Signing in...", "Saving..." etc. while a request is in flight.
- A proper hamburger menu below 700px width, instead of a horizontal-scrolling nav.
- Scroll position resets on every route change (`ScrollToTop`) - previously you could click a nav link and land mid-scroll on the next page.
- An EN/RW language toggle in the header (`I18nProvider` / `useI18n()`), covering the nav, home, login, register, client/fundi dashboards, booking statuses, and fundi profiles. Informational and admin pages still contain English text.

**Functionality**
- **Booking lifecycle:** `pending -> accepted/declined` still works as before, plus:
  - a fundi can mark an accepted booking **completed**,
  - a client can **cancel** their own pending booking,
  - once a booking is completed, the client sees an inline "rate this fundi" form (1-5 stars + comment). Reviews feed straight back into that fundi's rating on the home page.
- **Reviews:** new `api/reviews.php` + `data/reviews.json`. One review per completed booking, enforced server-side.
- **Notifications:** a small badge on the "Dashboard" nav link - a live pending-request count for fundis, an "things changed since you last looked" count for clients (tracked client-side per user, no backend changes needed for this one).
- **Admin overview:** the protected `/#/admin/overview` page (new `api/admin.php`) lists every user, booking, and review. Use the footer's **Admin Portal** link to open the admin sign-in page.
- **Fundi profiles:** select a fundi from the home-page directory to see their public profile and reviews. Booking from a profile carries that fundi into the client request form, including after login or registration.
- **Booking contacts:** accounts provide a phone number and email. The client and fundi see each other's details only after that booking is accepted; contacts are not shown on public profiles or pending bookings. Existing demo accounts can add their contact details from their dashboard. With Apache/PHP, the reveal is gated by the signed-in PHP session; the local-only demo mode is not a secure multi-user environment.
- **Demo mode:** when PHP is unavailable, a notice explains that changes are saved only in the current browser. Directory and dashboard screens also show loading, retry, and error states.

## Color palette: now derived from the logo
The old green (`#1F6B45`) was unrelated to the logo's actual green
(`#9BAF02`) - two different brand colors on one site. All color tokens in
`public/style.css` (`:root`) are now built from the logo's real colors:

- `--brand` (`#9BAF02`) is the literal logo green - used only in spots that
  don't need to carry their own text contrast (the logo itself, the small
  dot in the hero's "Booking request sent" preview).
- `--green` (`#616E00`) is the same hue, darkened until text/icons on it
  hit at least 4.5:1 contrast (WCAG AA) - this is what buttons, links,
  active nav state, and focus rings actually use. The raw logo green only
  manages 2.46:1 on white, which isn't readable as text or a white-on-green
  button.
- `--ink` (`#22250E`) is a dark, same-hue "olive-black" instead of the old
  teal-tinted near-black, so body text and the dark CTA band read as part
  of the same palette instead of clashing with the new green.
- `--surface` (`#F0F1E1`) is the logo's actual cream color.
- The avatar initials colors (`src/components/Avatar.jsx`) and a couple of
  hardcoded shadow/focus-ring `rgba()` values were also updated to match -
  those don't read from the CSS variables, so a future palette change needs
  to touch them separately.

Pure red (errors) and gold (star ratings) were left alone on purpose -
they're functional conventions, not brand colors, and overlaying brand
green on a 5-star rating would make the rating color ambiguous with
"available" badges.

## Rebrand: FundiLink -> Fundi
The site is now branded "Fundi" instead of "FundiLink" - page titles, the
About page, the contact email, and the footer copyright all updated.

The logo is now the uploaded "FUNdi" wordmark (olive green, cream "UN",
with a house-and-wrench icon worked into the "d"), instead of the old
hand-drawn two-stroke mark:
- `public/brand/fundi-logo.png` - the full wordmark, used in the header and
  footer via `src/components/Logo.jsx` (now a plain `<img>`, no more
  separate "FundiLink" text next to it - the logo already contains the name).
- `public/favicon.svg` / `favicon.png` / `favicon-32.png` - a rounded-square
  favicon cropped from the house-and-wrench icon.

The source file was a JPEG with a checkerboard (fake-transparency) background
baked into the pixels, so getting a clean cutout took a bit more than a
simple color threshold - the background was removed by flood-filling from
the image border (only pixels actually connected to the edge count as
background), which avoids accidentally punching holes in the logo's own
cream/white fill. If you ever need to redo this (a new logo file, say), that
approach is worth reusing rather than a plain "replace near-white with
transparent" threshold.

## Admin account
Admin access uses a separate account and login flow:

- **Admin Portal:** the footer links to `/#/admin`, which displays the admin
  login form. Successful sign-in redirects to `/#/admin/overview`.
- Only an account with `role: "admin"` can reach `/admin/overview` - everyone
  else (including client and fundi accounts) gets bounced to `/admin`,
  handled by the same `RequireRole` component the two dashboards use.

**Admin setup:** Admin login requires the PHP backend and a locally configured
`data/admin.json`. No default admin credentials are included in this repository.
The real file is ignored by Git; start with `data/admin.example.json` and add
your own admin record with a password hash generated locally:
```bash
php -r "echo password_hash(readline('Admin password: '), PASSWORD_DEFAULT), PHP_EOL;"
```
Use the resulting hash in `data/admin.json`:
```json
[
  {
    "username": "your-admin-name",
    "password": "paste-the-generated-hash-here",
    "role": "admin",
    "name": "Site Admin"
  }
]
```
Never commit or publish `data/admin.json`.

`data/users.json` is an empty seed file. Create client and fundi accounts via
the registration form; do not add real account passwords to frontend seed
data, which is bundled into the browser.

**`data/.htaccess`** blocks direct web access to the whole `data/` folder
(`/data/admin.json`, `/data/registered-users.json`, etc. all return `403`),
so even someone who finds the URL can't just read the files directly - they
have to go through the PHP endpoints, which only ever return data with
passwords stripped out.

**This only works if Apache is configured to honor `.htaccess` at all** -
check `AllowOverride All` is set for the folder you deploy into (XAMPP's
default `htdocs` config already allows this; a bare Apache install usually
defaults to `AllowOverride None` and needs it turned on, in that folder's
block in `apache2.conf` or a `conf-available` file). If you're not sure,
visit `/data/admin.json` in a browser after deploying - it should say
"Forbidden", not show you JSON.

Runtime files for bookings, reviews, profiles, registered users, and admin
accounts are ignored by Git. Their empty `.example.json` templates are copied
to the build output as needed.

## Project structure
```
src/
  components/   Header, Footer, Logo, StatusPill, RequireRole
  context/      SessionContext - who is logged in (replaces auth.js)
  lib/          store.js (data layer) and seedData.js (offline fallback)
  pages/        Home, About, Contact, Login, Register,
                DashboardClient, DashboardFundi
api/            PHP endpoints - identical to the plain-JS version
data/           JSON "database" - identical to the plain-JS version
server-time.php  the one page still rendered by PHP, not React
public/         favicon, bundled fonts, style.css (the same design system)
```

## Product presentation
The [Fundi app and business model presentation](./Fundi-App-Business-Model.pdf)
summarizes the product, proposed Kigali pilot, revenue hypotheses, trust
requirements, and validation roadmap. Its business model and example economics
are proposals to test, not current revenue or proven traction. The
[editable slide source](./Fundi-Presentation.html) is also included.

## Running it

### For development (no Apache needed)
```bash
npm install
npm run dev
```
Opens at `http://localhost:5173`. Since there's no PHP behind the Vite dev
server, login/registration/bookings automatically fall back to the
browser's `localStorage` (see "How persistence works" below). A notice in the
app explains that demo changes stay in this browser and are not shared; the
admin login still requires PHP.

### For the real thing, through Apache with PHP
```bash
npm run build            # builds the React app AND copies api/, data/,
                          # server-time.php into dist/
cp -r dist /var/www/html/fundilink-react
chmod 666 /var/www/html/fundilink-react/data/*.json
```
Then open `http://localhost/fundilink-react/index.html`. Routes are hash-based
(`#/about`, `#/login`, ...) so no Apache rewrite rules are needed.

Create a client or fundi account through the registration page to try the app.

## What's identical to the plain-JS version
- **Design:** the exact same `style.css`, fonts, and logo - served as a
  plain static file (`public/style.css`) rather than bundled, so
  `server-time.php` (a real PHP page, outside React) can use it too.
- **HTML5 validation:** every form still validates with plain attributes
  (`required`, `minLength`, `type="email"`, `min`, `pattern`) - React just
  renders the same `<input>` attributes as JSX. The password-match check on
  the register form still uses the native `setCustomValidity()` API, now
  called from a `ref` instead of `document.getElementById`.
- **Backend:** `api/*.php` and `data/*.json` are untouched. Accounts,
  bookings, and fundi profiles persist the same way as before.
- **Two account types, two dashboards:** same client/fundi split, same
  booking flow, same accept/decline actions.

## What's different (because it's React now)
- One page (`index.html`) instead of separate `.html` files - React Router
  (`HashRouter`) switches between pages without a full reload.
- Session state lives in a `SessionContext` (`useSession()` hook) instead of
  reading `localStorage` directly in every page's inline `<script>`.
- `RequireRole` is a small component that redirects to `/login` if you're
  not logged in as the right role - the React equivalent of the old
  `requireRole()` function.

## How persistence works
Every action (login, register, booking, profile) tries the PHP endpoint in
`api/` first. If that fetch fails - because you're running `npm run dev`
without Apache, or opened the build without a server - it falls back to
data bundled in `src/lib/seedData.js` plus `localStorage`, so the app is
still usable for development and demos. In this mode changes are local to the
current browser and do not update the PHP JSON files or sync to other devices.
