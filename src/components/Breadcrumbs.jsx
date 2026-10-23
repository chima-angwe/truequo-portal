import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleHome = (role) => role === 'verifier' ? '/my-tasks' : role === 'client' ? '/client' : '/';

function getCrumbs(pathname, role) {
  if (pathname === '/') return [{ label: 'Dashboard' }];
  if (pathname === '/client') return [{ label: 'Client overview' }];
  if (pathname === '/cases') return [{ label: 'Cases' }];
  if (pathname === '/cases/new') return [{ label: 'Cases', to: '/cases' }, { label: 'New request' }];
  if (pathname.startsWith('/cases/') && pathname.endsWith('/report')) return [{ label: 'Cases', to: '/cases' }, { label: 'Case details', to: pathname.replace(/\/report$/, '') }, { label: 'Final report' }];
  if (pathname.startsWith('/cases/')) return [{ label: 'Cases', to: '/cases' }, { label: 'Case details' }];
  if (pathname === '/my-tasks') return [{ label: 'My assignments' }];
  if (pathname === '/reviews') return [{ label: 'Review queue' }];
  if (pathname.startsWith('/tasks/') && pathname.endsWith('/assign')) return [{ label: 'Cases', to: '/cases' }, { label: 'Assign verification' }];
  if (pathname.startsWith('/tasks/') && pathname.endsWith('/review')) return [{ label: 'Cases', to: '/cases' }, { label: 'Review verification' }];
  if (pathname.startsWith('/tasks/') && pathname.endsWith('/verify')) return [{ label: 'My assignments', to: roleHome(role) }, { label: 'Verification workspace' }];
  return [{ label: 'Dashboard', to: roleHome(role) }];
}

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const crumbs = getCrumbs(pathname, user?.role);

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <Link to={roleHome(user?.role)} className="breadcrumb-home" aria-label="Go to home">⌂</Link>
      {crumbs.map((crumb, index) => (
        <span className="breadcrumb-item" key={`${crumb.label}-${index}`}>
          <span className="breadcrumb-separator" aria-hidden="true">/</span>
          {crumb.to && index < crumbs.length - 1
            ? <Link to={crumb.to}>{crumb.label}</Link>
            : <span aria-current={index === crumbs.length - 1 ? 'page' : undefined}>{crumb.label}</span>}
        </span>
      ))}
    </nav>
  );
}
