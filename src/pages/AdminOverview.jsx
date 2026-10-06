import { useEffect, useState } from 'react';
import { getAdminOverview } from '../lib/store';

export default function AdminOverview() {
  const [data, setData] = useState(null);

  useEffect(() => { getAdminOverview().then(setData); }, []);

  if (!data) return <main><p className="muted">Loading...</p></main>;

  return (
    <main>
      <section className="dash-head">
        <h1>Admin overview</h1>
        <p>Read-only view of everything stored by the app - for the class demo, not secured.</p>
      </section>

      <h2 className="section-title">Users ({data.users.length})</h2>
      <div className="table-wrap">
        <table className="admin-table">
          <thead><tr><th>Username</th><th>Role</th><th>Name</th><th>Trade</th><th>Location</th></tr></thead>
          <tbody>
            {data.users.map((u) => (
              <tr key={u.username}>
                <td>{u.username}</td><td>{u.role}</td><td>{u.name}</td>
                <td>{u.trade || '-'}</td><td>{u.location || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="section-title">Bookings ({data.bookings.length})</h2>
      <div className="table-wrap">
        <table className="admin-table">
          <thead><tr><th>Client</th><th>Fundi</th><th>Trade</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            {data.bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.clientUsername}</td><td>{b.fundiUsername}</td><td>{b.category}</td><td>{b.date}</td>
                <td><span className={`status-pill ${b.status}`}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="section-title">Reviews ({data.reviews.length})</h2>
      <div className="table-wrap">
        <table className="admin-table">
          <thead><tr><th>Fundi</th><th>Client</th><th>Rating</th><th>Comment</th><th>Date</th></tr></thead>
          <tbody>
            {data.reviews.map((r) => (
              <tr key={r.id}>
                <td>{r.fundiUsername}</td><td>{r.clientUsername}</td><td>{r.rating} &#9733;</td>
                <td>{r.comment || '-'}</td><td>{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
