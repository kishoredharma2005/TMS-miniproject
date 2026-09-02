import React from 'react';
import './HeroHeader.css';

const HeroHeader = ({ title, subtitle, breadcrumbs, actionNodes }) => {
  return (
    <div className="hero-header glass-panel" data-animate="fade-in">
      <div className="hero-content">
        {breadcrumbs && (
          <nav className="hero-breadcrumbs">
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} style={{ display: 'inline-flex', alignItems: 'center' }}>
                {crumb.link ? <a href={crumb.link}>{crumb.label}</a> : <span>{crumb.label}</span>}
                {idx < breadcrumbs.length - 1 && <span className="separator">/</span>}
              </span>
            ))}
          </nav>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actionNodes && (
        <div className="hero-actions">
          {actionNodes}
        </div>
      )}
    </div>
  );
};

export default HeroHeader;
