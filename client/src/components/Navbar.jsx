import React, { useState } from 'react';
import './styles/Navbar.css';
import { Bell } from 'lucide-react';

const navItems = [
  { hi: 'होम',               en: 'Home'               },
  { hi: 'नई पंजीकरण',       en: 'New Registration'   },
  { hi: 'पंजीकरण नवीनीकरण',  en: 'Renew Registration' },
  { hi: 'लाइसेंस डाउनलोड',   en: 'Download License'   },
  
  { hi: 'प्रश्न और प्रतिक्रिया',  en: 'Query & Feedback'   },
  { hi: 'संपर्क करें',         en: 'Contact Us'         },
];

function Navbar({ languageType, user, notifications = [], onLogin, onLogout, onLanguageChange }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const label = (item) => languageType === 'hi' ? item.hi : item.en;

  return (
    <nav className="navbar navbar--gov">
      <div className="navbar__container">
        {/* Logo */}
        <div className="navbar__logo">
          <span className="gov-logo">Sewa Bharti Gorakhpur</span>
        </div>

        {/* Hamburger for Mobile */}
        <button
          className="hamburger"
          aria-label="Toggle menu"
          onClick={() => setShowMenu(!showMenu)}
        >
          <span /><span /><span />
        </button>

        {/* Navigation Links */}
        <ul className={`navbar__menu ${showMenu ? 'show' : ''}`}>  
          {navItems.map((item, idx) => (
            <li
              key={idx}
              className="nav-item nav-item--gov"
              onClick={() => alert(`You clicked: ${label(item)}`)}
            >
              {label(item)}
            </li>
          ))}
        </ul>

        <div className="navbar__actions">
          {/* Notification Bell */}
          <div className="notif">
            <button
              className="notif__icon-btn"
              aria-label="Notifications"
              onClick={() => setShowNotif(!showNotif)}
            >
              <Bell className="notif__icon" size={20} />
              {notifications.length > 0 && <span className="notif__badge">{notifications.length}</span>}
            </button>
            {showNotif && (
              <ul className="notif__dropdown">
                {notifications.length > 0 ? (
                  notifications.map((note, i) => (
                    <li key={i} className="notif__item">{note}</li>
                  ))
                ) : (
                  <li className="notif__empty">No notifications</li>
                )}
              </ul>
            )}
          </div>

          {/* Language Toggle */}
          <div className="lang-toggle-container">
            <label htmlFor="lang-toggle" className="lang-toggle__label">Language:</label>
            <button id="lang-toggle" className="lang-toggle" aria-label="Toggle language">
              <span
                className={languageType === 'hi' ? 'active' : ''}
                onClick={() => onLanguageChange && onLanguageChange('hi')}
              >अ</span>
              <span>/</span>
              <span
                className={languageType === 'en' ? 'active' : ''}
                onClick={() => onLanguageChange && onLanguageChange('en')}
              >A</span>
            </button>
          </div>

          {/* Login / Logout */}
          <div className="auth-action">
            {user ? (
              <button className="btn btn--gov" onClick={onLogout}>Logout</button>
            ) : (
              <button className="btn btn--gov" onClick={onLogin}>Login</button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;