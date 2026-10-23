import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandWordmark from './BrandMark';
import Breadcrumbs from './Breadcrumbs';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [location.pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow; };
  }, [menuOpen]);

  const role = user?.role;
  const navItems = role === 'verifier'
    ? [{ to: '/my-tasks', label: 'My assignments', icon: '▤' }]
    : role === 'client'
      ? [{ to: '/client', label: 'Overview', icon: '◫', end: true }, { to: '/cases', label: 'My cases', icon: '▤', end: true }, { to: '/cases/new', label: 'New request', icon: '+' }]
      : [
          { to: '/', label: 'Dashboard', icon: '◫', end: true },
          { to: '/cases', label: 'Cases', icon: '▤', end: true },
          ...(role === 'supervisor' ? [{ to: '/reviews', label: 'Review queue', icon: '✓' }] : []),
        ];
  const initials = (user?.name || 'U').split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

  function handleLogout() { logout(); navigate('/login'); }

  return (
    <div className="layout-root lg:flex">
      <header className="layout-mobile-header lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4">
        <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open navigation" aria-expanded={menuOpen} aria-controls="portal-sidebar" className="-ml-2 p-2 rounded-lg text-stone-600 hover:bg-stone-100">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <BrandWordmark />
      </header>
      <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation" className={`lg:hidden fixed inset-0 z-40 bg-black/40 transition-opacity ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
      <aside id="portal-sidebar" className={`layout-sidebar fixed inset-y-0 left-0 z-50 flex max-w-[86vw] flex-col border-r transition-transform duration-200 ${menuOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:z-auto lg:w-[264px] lg:max-w-none lg:translate-x-0`}>
        <div className="layout-brand flex items-start justify-between">
          <div><BrandWordmark /><div className="layout-brand-caption">Verification operations</div></div>
          <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation" className="lg:hidden -mr-2 -mt-1 p-2 text-stone-500">×</button>
        </div>
        <nav className="layout-nav flex-1" aria-label="Main navigation">
          <div className="layout-nav-label">Workspace</div>
          {navItems.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `layout-nav-link ${isActive ? 'active' : ''}`}><span className="nav-glyph" aria-hidden="true">{item.icon}</span>{item.label}</NavLink>)}
        </nav>
        <div className="layout-user flex items-start gap-3">
          <div className="layout-avatar" aria-hidden="true">{initials}</div>
          <div className="min-w-0 flex-1"><div className="truncate text-xs font-bold text-ink">{user?.name}</div><div className="mt-0.5 text-[10px] capitalize text-stone-500">{role?.replace('_', ' ')}</div><button type="button" onClick={handleLogout} className="layout-signout">Sign out</button></div>
        </div>
      </aside>
      <main className="portal-main min-w-0 flex-1 overflow-x-hidden">
        <div className="portal-topbar"><Breadcrumbs /><div className="portal-topbar-user"><span className="portal-topbar-avatar">{initials}</span><span>{user?.name}</span></div></div>
        <div className="portal-page-area">{children}</div>
      </main>
    </div>
  );
}
