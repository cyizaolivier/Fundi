import { Navigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

// Equivalent of the old requireRole() helper: sends the visitor to a login
// page if they're not logged in as the right kind of account. Admin uses
// its own dedicated login page, kept separate from (and unlinked from) the
// client/fundi login so the two don't get mixed up in the nav.
export default function RequireRole({ role, children, redirectTo = '/login' }) {
  const { session } = useSession();
  if (!session || session.role !== role) return <Navigate to={redirectTo} replace />;
  return children;
}
