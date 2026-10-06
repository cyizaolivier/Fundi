// Data layer. Every action first tries the PHP endpoints in /api (which read
// and write the JSON files in /data). If PHP isn't running - e.g. the page was
// opened from a plain file or a static server - it falls back to the starter
// data in seedData.js plus localStorage, so the app still works end to end.

import { SEED } from './seedData';

const SESSION_KEY = 'fundilink_session';
const LOCAL = {
  users: 'fundilink_local_users',
  bookingsExtra: 'fundilink_local_bookings',
  bookingStatus: 'fundilink_local_bookings_status',
  profiles: 'fundilink_local_profiles',
  contacts: 'fundilink_local_contacts',
  reviewsExtra: 'fundilink_local_reviews',
};

const lsGet = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
const lsSet = (k, v) => localStorage.setItem(k, JSON.stringify(v));

async function callApi(path, body) {
  try {
    const res = await fetch(path, body === undefined ? {} : {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const data = await res.json();
    return data && typeof data.ok === 'boolean' ? data : null;
  } catch { return null; }
}

export async function isBackendAvailable() {
  const api = await callApi('api/fundis.php');
  return Boolean(api?.ok);
}

/* ---------------- session (who is logged in on this device) ---------------- */
export function saveSession(u) { lsSet(SESSION_KEY, { username: u.username, role: u.role, name: u.name, phone: u.phone || '', email: u.email || '' }); }
export function getSession() { return lsGet(SESSION_KEY, null); }
export async function clearSession() {
  await callApi('api/logout.php', {});
  localStorage.removeItem(SESSION_KEY);
}

/* ---------------- accounts ---------------- */
export async function handleLogin(username, password, role) {
  const api = await callApi('api/login.php', { username, password, role });
  if (api) {
    if (!api.ok) return { ok: false, message: api.message };
    saveSession(api.user); return { ok: true, user: api.user };
  }
  // Admin credentials are deliberately never bundled into the frontend (see
  // api/login.php), so there is no offline fallback for this role - it only
  // works with PHP actually running.
  if (role === 'admin') return { ok: false, message: 'Admin login needs the PHP backend running (see README).' };
  const all = [...SEED.users, ...lsGet(LOCAL.users, [])];
  const u = all.find((x) => x.username.toLowerCase() === username.toLowerCase() && x.password === password && x.role === role);
  if (!u) return { ok: false, message: 'Incorrect username, password, or account type.' };
  saveSession(u); return { ok: true, user: u };
}

export async function handleRegister(newUser) {
  const api = await callApi('api/register.php', newUser);
  if (api) {
    if (!api.ok) return { ok: false, message: api.message };
    saveSession(api.user); return { ok: true, user: api.user };
  }
  const all = [...SEED.users, ...lsGet(LOCAL.users, [])];
  if (all.some((x) => x.username.toLowerCase() === newUser.username.toLowerCase())) return { ok: false, message: 'That username is already taken.' };
  lsSet(LOCAL.users, [...lsGet(LOCAL.users, []), newUser]);
  saveSession(newUser); return { ok: true, user: newUser };
}

/* ---------------- fundis ---------------- */
export async function getFundis() {
  const api = await callApi('api/fundis.php');
  if (api && api.ok) return api.fundis;
  const profiles = lsGet(LOCAL.profiles, {});
  const reviews = [...SEED.reviews, ...lsGet(LOCAL.reviewsExtra, [])];
  const list = [...SEED.fundis];
  lsGet(LOCAL.users, []).filter((u) => u.role === 'fundi').forEach((u) => {
    list.push({ id: 'r-' + u.username, username: u.username, name: u.name, trade: u.trade || 'Other',
      location: u.location || '', rate: null, rateUnit: 'per hour', rating: null, bio: '' });
  });
  return list.map((f) => {
    const merged = { ...f, ...(profiles[f.username] || {}) };
    const mine = reviews.filter((r) => r.fundiUsername === f.username);
    if (mine.length > 0) {
      merged.rating = Math.round((mine.reduce((s, r) => s + r.rating, 0) / mine.length) * 10) / 10;
      merged.reviewCount = mine.length;
    } else {
      merged.reviewCount = 0;
    }
    return merged;
  });
}

export async function saveProfile(username, profile) {
  const api = await callApi('api/profile.php', { username, ...profile });
  if (api) return api;
  const all = lsGet(LOCAL.profiles, {});
  all[username] = profile; lsSet(LOCAL.profiles, all);
  return { ok: true };
}

export async function saveContactDetails(username, contact) {
  const api = await callApi('api/profile.php', { action: 'contact', username, ...contact });
  if (api && !api.ok) return api;
  if (!api) {
    const contacts = lsGet(LOCAL.contacts, {});
    contacts[username] = { phone: contact.phone, email: contact.email };
    lsSet(LOCAL.contacts, contacts);
  }
  const session = getSession();
  if (session?.username === username) saveSession({ ...session, ...contact });
  return api || { ok: true };
}

/* ---------------- bookings ---------------- */
export async function loadAllBookings(viewerUsername) {
  const api = await callApi('api/bookings.php', { action: 'list', viewerUsername });
  if (api && api.ok) return api.bookings;
  const status = lsGet(LOCAL.bookingStatus, {});
  const users = [...SEED.users, ...lsGet(LOCAL.users, [])];
  const contacts = lsGet(LOCAL.contacts, {});
  return [...SEED.bookings, ...lsGet(LOCAL.bookingsExtra, [])].map((booking) => {
    const merged = { ...booking, status: status[booking.id] || booking.status };
    if (merged.status === 'accepted' && viewerUsername) {
      const otherUsername = viewerUsername === booking.clientUsername ? booking.fundiUsername
        : viewerUsername === booking.fundiUsername ? booking.clientUsername : null;
      const other = users.find((user) => user.username === otherUsername);
      if (otherUsername && other) {
        merged.otherContact = {
          name: other.name,
          phone: contacts[otherUsername]?.phone || other.phone || '',
          email: contacts[otherUsername]?.email || other.email || '',
        };
      }
    }
    return merged;
  });
}

export async function addBooking(booking) {
  const api = await callApi('api/bookings.php', { action: 'add', booking });
  if (api) return api;
  const b = { ...booking, id: 'local-' + Date.now(), status: 'pending' };
  lsSet(LOCAL.bookingsExtra, [...lsGet(LOCAL.bookingsExtra, []), b]);
  return { ok: true, booking: b };
}

export async function setBookingStatus(id, status, actingUsername) {
  const api = await callApi('api/bookings.php', { action: 'status', id, status, actingUsername });
  if (api) return api;
  const s = lsGet(LOCAL.bookingStatus, {}); s[id] = status; lsSet(LOCAL.bookingStatus, s);
  return { ok: true };
}

/* ---------------- reviews ---------------- */
export async function getReviews(fundiUsername) {
  const api = await callApi('api/reviews.php', { action: 'list', fundiUsername });
  if (api && api.ok) return api.reviews;
  const all = [...SEED.reviews, ...lsGet(LOCAL.reviewsExtra, [])];
  return fundiUsername ? all.filter((r) => r.fundiUsername === fundiUsername) : all;
}

export async function addReview({ bookingId, clientUsername, fundiUsername, rating, comment }) {
  const api = await callApi('api/reviews.php', { action: 'add', bookingId, clientUsername, rating, comment });
  if (api) return api;
  const all = [...SEED.reviews, ...lsGet(LOCAL.reviewsExtra, [])];
  if (all.some((r) => r.bookingId === bookingId)) return { ok: false, message: 'You already reviewed this booking.' };
  const review = { id: 'local-rv-' + Date.now(), bookingId, clientUsername, fundiUsername, rating, comment, date: new Date().toISOString().split('T')[0] };
  lsSet(LOCAL.reviewsExtra, [...lsGet(LOCAL.reviewsExtra, []), review]);
  return { ok: true, review };
}

/* ---------------- admin overview (read-only, no auth - demo only) ---------------- */
export async function getAdminOverview() {
  const api = await callApi('api/admin.php');
  if (api && api.ok) return api;
  const strip = (u) => { const { password, ...rest } = u; return rest; };
  const users = [...SEED.users.map(strip), ...lsGet(LOCAL.users, []).map(strip)];
  const bookings = await loadAllBookings();
  const reviews = [...SEED.reviews, ...lsGet(LOCAL.reviewsExtra, [])];
  return { ok: true, users, bookings, reviews };
}

/* ---------------- "unread" notification counts (client-side only) ---------------- */
const seenKey = (username) => `fundilink_seen_${username}`;

// Fundi badge: a plain count of bookings still waiting on them - always
// accurate, no "seen" bookkeeping needed.
export function pendingCountForFundi(bookings, username) {
  return bookings.filter((b) => b.fundiUsername === username && b.status === 'pending').length;
}

// Client badge: bookings whose status has moved on (accepted/declined/
// completed) since the client last opened their dashboard.
export function unseenCountForClient(bookings, username) {
  const seen = lsGet(seenKey(username), {});
  return bookings.filter((b) => b.clientUsername === username && ['accepted', 'declined', 'completed'].includes(b.status) && seen[b.id] !== b.status).length;
}

export function markClientBookingsSeen(bookings, username) {
  const seen = lsGet(seenKey(username), {});
  bookings.filter((b) => b.clientUsername === username).forEach((b) => { seen[b.id] = b.status; });
  lsSet(seenKey(username), seen);
}

export function priceLabel(f) {
  return f.rate ? `${Number(f.rate).toLocaleString()} RWF` : null;
}

export function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}
