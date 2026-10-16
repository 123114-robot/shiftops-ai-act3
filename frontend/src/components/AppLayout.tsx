import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/auth-context';
import { ThemeToggle } from './ThemeToggle';

const managerNavigation = [
  { group: 'General', links: [{ to: '/dashboard', label: 'Dashboard' }] },
  { group: 'Workforce', links: [{ to: '/employees', label: 'Employees' }, { to: '/roster', label: 'Weekly Roster' }, { to: '/shifts', label: 'Shifts' }, { to: '/leave-requests', label: 'Leave Requests' }] },
  { group: 'AI Operations', links: [{ to: '/shiftops', label: 'ShiftOps Copilot' }] },
];
const employeeNavigation = [
  { group: 'My workspace', links: [{ to: '/my-schedule', label: 'My schedule' }, { to: '/my-roster', label: 'My roster' }, { to: '/availability', label: 'My availability' }, { to: '/my-leave', label: 'My leave' }] },
];

export function AppLayout({ title, eyebrow, children, backTo, backLabel }: { title: string; eyebrow?: string; children: ReactNode; backTo?: string; backLabel?: string }) {
  const { user, logout } = useAuth(); const location = useLocation();
  const navigation = user?.role === 'MANAGER' ? managerNavigation : employeeNavigation;
  return <div className="app-frame">
    <aside className="sidebar"><Link className="brand-lockup" to={user?.role === 'MANAGER' ? '/dashboard' : '/my-schedule'}><span className="brand-mark">S</span><span><strong>ShiftOps AI</strong><small>Synqvera Labs</small></span></Link>
      <nav aria-label="Primary navigation">{navigation.map(section => <section className="nav-group" key={section.group}><p>{section.group}</p>{section.links.map(link => <Link key={link.to} to={link.to} aria-current={location.pathname === link.to ? 'page' : undefined}>{link.label}</Link>)}</section>)}</nav>
    </aside>
    <div className="workspace"><header className="topbar"><div>{backTo && <Link className="back-link" to={backTo}>← {backLabel ?? 'Back'}</Link>}<span className="topbar-title">{title}</span></div><div className="topbar-actions"><ThemeToggle/><span className="user-chip"><small>{user?.role}</small>{user?.email}</span><button className="button button--quiet" type="button" onClick={logout}>Log out</button></div></header>
      <main className="page-content"><header className="page-header">{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1></header>{children}</main>
    </div>
  </div>;
}
