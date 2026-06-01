import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getUser, logout } from '../services/api.js';

const pageTitles = {
  '/': 'Asset Command Center',
  '/users': 'User Management',
  '/assets': 'Asset Register',
  '/assignments': 'Asset Assignment Desk',
  '/materials': 'Material Management',
  '/material-issues': 'Issued Materials',
  '/inventory': 'Inventory List',
  '/my-assets': 'My Assets',
};

const adminLinks = [
  { to: '/', label: 'Dashboard', icon: '⌂' },
  { to: '/users', label: 'Users', icon: 'US' },
  { to: '/assets', label: 'Assets', icon: 'AS' },
  { to: '/assignments', label: 'Assignments', icon: '↔' },
  { to: '/materials', label: 'Materials', icon: 'MT' },
  { to: '/material-issues', label: 'Issued Materials', icon: 'IM' },
  { to: '/inventory', label: 'Inventory List', icon: 'IN' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const isAdmin = user?.role === 'ORG_ADMIN' || user?.role === 'ASSET_MANAGER';
  const currentTitle = pageTitles[location.pathname] || 'IT Asset Management System';

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="shell">
      <aside className="sidebar glass">
        <div className="brand">
          <div className="brand-mark">IT</div>
          <div>
            <h2>AssetHub</h2>
            <span>Management System</span>
          </div>
        </div>

        <nav className="nav">
          {isAdmin && <div className="nav-section-title">Organization</div>}
          {isAdmin && adminLinks.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div className="nav-section-title">User Portal</div>
          <NavLink to="/my-assets">
            <span className="nav-icon">MY</span>
            <span>My Assets</span>
          </NavLink>
        </nav>

        <div className="profile-card">
          <div className="avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div>
            <strong>{user?.name || 'User'}</strong>
            <small>{user?.role || 'Signed in'}</small>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar glass">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h1>{currentTitle}</h1>
            <p className="topbar-subtitle">Professional inventory control, digital signatures, and asset lifecycle tracking.</p>
          </div>
          <div className="top-actions">
            <div className="search-pill"><span>●</span><span>System online</span></div>
            <button className="btn ghost" onClick={onLogout}>Logout</button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
