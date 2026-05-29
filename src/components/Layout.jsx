import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getUser, logout } from '../services/api.js';

export default function Layout() {
  const navigate = useNavigate();
  const user = getUser();
  const isAdmin = user?.role === 'ORG_ADMIN' || user?.role === 'ASSET_MANAGER';

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
          <NavLink to="/">Dashboard</NavLink>
          {isAdmin && <NavLink to="/users">Users</NavLink>}
          {isAdmin && <NavLink to="/assets">Assets</NavLink>}
          {isAdmin && <NavLink to="/assignments">Assignments</NavLink>}
          {isAdmin && <NavLink to="/materials">Materials</NavLink>}
          <NavLink to="/my-assets">My Assets</NavLink>
        </nav>

        <div className="profile-card">
          <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
          <div>
            <strong>{user?.name}</strong>
            <small>{user?.role}</small>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar glass">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h1>IT Asset Management System</h1>
          </div>
          <button className="btn ghost" onClick={onLogout}>Logout</button>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
