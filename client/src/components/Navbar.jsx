import React, { useState, useEffect, useRef } from 'react';
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
  const notifRef = useRef(null);
  const menuRef = useRef(null);
  
  const label = (item) => languageType === 'hi' ? item.hi : item.en;

  // Close notification dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <nav className="navbar navbar--gov">
      <div className="navbar__container">
        {/* Top Row */}
        <div className="navbar__top-row">
          <button
            className={`hamburger ${showMenu ? 'active' : ''}`}
            aria-label="Toggle menu"
            onClick={toggleMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className="navbar__logo">
            <img src="./logo.png" alt="Logo" className="navbar__logo-img" />
            <span className="gov-logo">Nagar Nigam Gorakhpur</span>
          </div>

          <div className="navbar__actions">
            {/* Language toggle and notifications always together */}
            <div className="navbar__controls">
              <div className="lang-toggle-container">
                <button className="lang-toggle" aria-label="Toggle language">
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
                <div className="notif" ref={notifRef}>
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
                </div>
              )}
            </div>

            {/* Desktop-only elements */}
            <div className="navbar__desktop-only">
              {user && (
                <span className="navbar__username">{user.username}</span>
              )}
              
              <div className="auth-action">
                {user
                  ? <button className="btn btn--gov" onClick={onLogout}>Logout</button>
                  : <button className="btn btn--gov" onClick={() => navigate('/login')}>Login</button>
                }
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`navbar__mobile-menu ${showMenu ? 'show' : ''}`} ref={menuRef}>
          <ul className="navbar__menu">
            {navItems.map((item, idx) => (
              <li
                key={idx}
                className="nav-item nav-item--gov"
                onClick={() => handleNavItemClick(item.en)}
              >
                {label(item)}
              </li>
            ))}
            
            {/* Mobile-only auth action */}
            <li className="nav-item nav-item--gov mobile-auth">
              {user
                ? <button className="btn btn--gov" onClick={onLogout}>Logout</button>
                : <button className="btn btn--gov" onClick={() => navigate('/login')}>Login</button>
              }
            </li>
          </ul>
        </div>
         <div className='navbar__desktop-only'>
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
      </div>
    </nav>
  );
}

export default Navbar;