import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/candidates', label: 'All Candidates' },
    { path: '/add', label: 'Add Candidate' },
    { path: '/match', label: 'AI Shortlist' }
  ];

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-brand">
        <span className="brand-icon">✨</span>
        <span className="brand-text">TalentAI</span>
      </div>
      <div className="navbar-links">
        {navLinks.map((link) => (
          <Link 
            key={link.path} 
            to={link.path} 
            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
