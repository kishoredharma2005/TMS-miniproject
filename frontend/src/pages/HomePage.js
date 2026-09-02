import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import HeroHeader from '../components/HeroHeader';

const HomePage = () => {
  const { user, isAuthenticated } = useContext(AuthContext);

  return (
    <div className="page-container">
      <HeroHeader 
        title="Welcome to TMS"
        subtitle="Intelligent Complaint Management System"
      />

      <div className="glass-panel" data-animate="fade-in" style={{ padding: 'var(--space-4)' }}>
        {isAuthenticated ? (
          <div className="welcome-section">
            <h2 style={{ fontSize: '28px', marginBottom: 'var(--space-2)', color: 'var(--text-main)' }}>
              Hello, {user?.username}!
            </h2>
            <p style={{ color: 'var(--accent-teal)', fontWeight: '600', marginBottom: 'var(--space-4)', fontSize: '18px' }}>
              Role: <span style={{ 
                background: 'rgba(30, 132, 127, 0.1)', 
                padding: '4px 12px', 
                borderRadius: 'var(--radius-pill)',
                marginLeft: '8px'
              }}>{user?.role}</span>
            </p>

            {user?.role === 'SuperAdmin' && (
              <div className="card-lift" style={{
                background: 'var(--surface)',
                borderLeft: '4px solid var(--accent-amber)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--slate-200)'
              }}>
                <h3 style={{ color: 'var(--text-main)', marginBottom: 'var(--space-2)', fontSize: '20px' }}>
                  SuperAdmin Dashboard Access
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
                  You have full privilege access to all system master configurations.
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: 'var(--space-2)'
                }}>
                  {[
                    { name: 'Departments', path: '/departments' },
                    { name: 'Programmes', path: '/programmes' },
                    { name: 'Blocks', path: '/blocks' },
                    { name: 'Rooms', path: '/rooms' },
                    { name: 'Roles', path: '/roles' },
                    { name: 'Users', path: '/users' }
                  ].map(item => (
                    <Link to={item.path} key={item.name} style={{
                      padding: '12px 16px',
                      background: 'var(--glass-bg)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                      fontWeight: '500',
                      border: '1px solid var(--glass-border)',
                      display: 'flex',
                      alignItems: 'center',
                      textDecoration: 'none',
                      gap: '8px'
                    }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-teal)' }}></div>
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
           <div style={{ textAlign: 'center', padding: 'var(--space-6) var(--space-4)' }}>
              <div style={{ 
                width: 80, height: 80, 
                borderRadius: '50%', 
                background: 'rgba(30, 132, 127, 0.1)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto var(--space-4)'
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
              </div>
              <h3 style={{ fontSize: '24px', marginBottom: 'var(--space-2)', color: 'var(--text-main)' }}>Authentication Required</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Please login to access the ticketing platform</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
