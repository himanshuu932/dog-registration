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

function Navbar({ languageType, user, notifications = [], onLogin, onLogout, onLanguageChange }) {
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
    case 'Renew Registration':
      console.log('Navigate to Renew Registration');
      break;
    case 'Download License':
      console.log('Navigate to Download License');
      break;
    case 'Query & Feedback':
      console.log('Navigate to Query & Feedback');
      break;
    case 'Contact Us':
      console.log('Navigate to Contact Us');
      break;
    default:
      console.warn('Unhandled nav item:', label);
  }
};

  return (
    <nav className="navbar navbar--gov">
      <div className="navbar__container">
        {/* Top Row - Always visible elements */}
        <div className="navbar__top-row">
         
          <div className="navbar__logo">
            <img src="./logo.png" alt="Logo" className="navbar__logo-img" />
            <span className="gov-logo">Nagar Nigam Gorakhpur</span>
          </div>

          {/* Hamburger for Mobile */}
          <button
            className="hamburger"
            aria-label="Toggle menu"
            onClick={() => setShowMenu(!showMenu)}
          >
            <span /><span /><span />
          </button>

          <div className="navbar__actions">
            {/* Username & Notification Bell - Only if user is logged in */}
            {user && (
              <div className="notif">
                <button
                  className="notif__icon-btn"
                  aria-label="Notifications"
                  onClick={() => setShowNotif(!showNotif)}
                >
                  <Bell className="notif__icon" size={20} />
                  {notifications.length > 0 && (
                    <span className="notif__badge">{notifications.length}</span>
                  )}
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
                {/* Username Display in the top row */}
                <span className="navbar__username">{user.name}</span>
              </div>
            )}

            {/* Language Toggle */}
            <div className="lang-toggle-container">
            
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

        {/* Bottom Row - Navigation items only visible when logged in */}
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
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;