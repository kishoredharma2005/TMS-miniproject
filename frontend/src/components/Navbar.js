import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const NavItem = ({ to, icon, label, onClick, hideOnMobile }) => {
    const isActive = location.pathname === to;
    if (hideOnMobile && window.innerWidth <= 768) return null; // Simple mobile hiding approach for excessive links
    return (
      <div className={`nav-item ${isActive ? 'active' : ''} ${hideOnMobile ? 'desktop-only' : ''}`}>
        {onClick ? (
          <button className="nav-link" onClick={onClick} title={label}>
            <span className="icon">{icon}</span>
            <span className="label">{label}</span>
          </button>
        ) : (
          <Link to={to} className="nav-link" title={label}>
            <span className="icon">{icon}</span>
            <span className="label">{label}</span>
          </Link>
        )}
      </div>
    );
  };

  // Modern minimal SVGs
  const Icons = {
    home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    raise: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>,
    myComplaints: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
    dept: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    prog: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
    block: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>,
    room: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3z" /><path d="M9 3v18" /><path d="M15 3v18" /><path d="M3 9h18" /><path d="M3 15h18" /></svg>,
    role: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    allComp: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
    login: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>,
    logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    admin: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg> // Combined icon for mobile admin
  };

  return (
    <nav className="nav-rail">
      <div className="nav-brand">
        <Link to="/" className="brand-logo">
          <div className="logo-glow"></div>
          <span>T</span>
        </Link>
      </div>

      <div className="nav-menu">
        {isAuthenticated ? (
          <>
            <NavItem to="/complaints/new" icon={Icons.raise} label="Raise" />

            {user?.role !== 'SuperAdmin' && (
              <NavItem to="/my-complaints" icon={Icons.myComplaints} label="My Tickets" />
            )}

            {user?.role === 'SuperAdmin' && (
              <>
                <div className="nav-divider"></div>
                <NavItem to="/departments" icon={Icons.dept} label="Depts" />
                <NavItem to="/programmes" icon={Icons.prog} label="Progs" />
                <NavItem to="/blocks" icon={Icons.block} label="Blocks" />
                <NavItem to="/rooms" icon={Icons.room} label="Rooms" />
                <NavItem to="/roles" icon={Icons.role} label="Roles" />
                <NavItem to="/users" icon={Icons.user} label="Users" />
                <div className="nav-divider"></div>
                <NavItem to="/complaints" icon={Icons.allComp} label="All Tickets" />
                <NavItem to="/reports" icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" /><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8" /></svg>
                } label="Reports" />
              </>
            )}

            <div className="nav-user-profile">
              <div className="avatar">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>

            <NavItem to="/" onClick={handleLogout} icon={Icons.logout} label="Logout" />
          </>
        ) : (
          <NavItem to="/login" icon={Icons.login} label="Login" />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
