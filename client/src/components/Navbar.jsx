import React, { useState } from 'react';
import './styles/Navbar.css';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { hi: 'होम',               en: 'Home'               },
  { hi: 'नई पंजीकरण',       en: 'New Registration'   },
  { hi: 'पंजीकरण नवीनीकरण',  en: 'Renew Registration' },
  { hi: 'लाइसेंस डाउनलोड',   en: 'Download License'   },
  { hi: 'प्रश्न और प्रतिक्रिया',  en: 'Query & Feedback'   },
  { hi: 'संपर्क करें',         en: 'Contact Us'         },
];

function Navbar({ languageType, user, notifications = [], onLogout, onLanguageChange }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const navigate = useNavigate();
  
  const label = (item) => languageType === 'hi' ? item.hi : item.en;

  const handleNavItemClick = (label) => {
    switch (label) {
      case 'Home':
        navigate('/home');
        break;
      case 'New Registration':
        navigate('/pet-register');
        break;
      // add other cases...
      default:
        console.warn('Unhandled nav item:', label);
    }
    setShowMenu(false);
  };

  return (
    <nav className="navbar navbar--gov">
      <div className="navbar__container">
        {/* Top Row */}
        <div className="navbar__top-row">
          <button
            className="hamburger"
            aria-label="Toggle menu"
            onClick={() => setShowMenu(!showMenu)}
          >
            <span /><span /><span />
          </button>

          <div className="navbar__logo">
            <img src="./logo.png" alt="Logo" className="navbar__logo-img" />
            <span className="gov-logo">Nagar Nigam Gorakhpur</span>
          </div>

          {/* Language toggle: mobile-only */}
          <div className="lang-toggle-container mobile-only">
            <button id="lang-toggle" className="lang-toggle" aria-label="Toggle language">
              <span
                className={languageType === 'hi' ? 'active' : ''}
                onClick={() => onLanguageChange?.('hi')}
              >अ</span>
              <span>/</span>
              <span
                className={languageType === 'en' ? 'active' : ''}
                onClick={() => onLanguageChange?.('en')}
              >A</span>
            </button>
          </div>

          {/* Desktop-only actions */}
          <div className="navbar__actions">
            {/* Desktop-only language toggle */}
            <div className="lang-toggle-container desktop-only">
              <button id="lang-toggle" className="lang-toggle" aria-label="Toggle language">
                <span
                  className={languageType === 'hi' ? 'active' : ''}
                  onClick={() => onLanguageChange?.('hi')}
                >अ</span>
                <span>/</span>
                <span
                  className={languageType === 'en' ? 'active' : ''}
                  onClick={() => onLanguageChange?.('en')}
                >A</span>
              </button>
            </div>

            {user && (
              <div className="notif">
                <button
                  className="notif__icon-btn"
                  aria-label="Notifications"
                  onClick={() => setShowNotif(!showNotif)}
                >
                  <Bell size={20} />
                  {notifications.length > 0 && <span className="notif__badge">{notifications.length}</span>}
                </button>
                {showNotif && (
                  <ul className="notif__dropdown">
                    {notifications.length > 0
                      ? notifications.map((n, i) => <li key={i} className="notif__item">{n}</li>)
                      : <li className="notif__empty">No notifications</li>}
                  </ul>
                )}
                <span className="navbar__username">{user.username}</span>
              </div>
            )}

            <div className="auth-action">
              {user
                ? <button className="btn btn--gov" onClick={onLogout}>Logout</button>
                : <button className="btn btn--gov" onClick={() => navigate('/login')}>Login</button>
              }
            </div>
          </div>
        </div>

        {/* Bottom Row / Sliding drawer */}
        {user && (
          <div className="navbar__bottom-row">
            <ul className={`navbar__menu ${showMenu ? 'show' : ''}`}>
              {navItems.map((item, idx) => (
                <li
                  key={idx}
                  className="nav-item nav-item--gov"
                  onClick={() => handleNavItemClick(item.en)}
                >
                  {label(item)}
                </li>
              ))}

              {/* Mobile-only Notifications */}
              <li className="nav-item nav-item--gov mobile-only">
                <button
                  className="notif__icon-btn"
                  aria-label="Notifications"
                  onClick={() => setShowNotif(!showNotif)}
                >
                  <Bell size={20} />
                  {notifications.length > 0 && <span className="notif__badge">{notifications.length}</span>}
                </button>
                {showNotif && (
                  <ul className="notif__dropdown">
                    {notifications.length > 0
                      ? notifications.map((n, i) => <li key={i} className="notif__item">{n}</li>)
                      : <li className="notif__empty">No notifications</li>}
                  </ul>
                )}
              </li>

              {/* Mobile-only Auth */}
              <li className="nav-item nav-item--gov mobile-only">
                {user
                  ? <button className="btn btn--gov" onClick={onLogout}>Logout</button>
                  : <button className="btn btn--gov" onClick={() => navigate('/login')}>Login</button>
                }
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
);
}

export default Navbar;