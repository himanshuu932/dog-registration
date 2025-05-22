import React, { useState, useEffect, useRef } from 'react';
import './styles/Navbar.css';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Navigation items for regular users with translations
const userNavItems = [
  { hi: 'होम', en: 'Home' },
  { hi: 'नई पंजीकरण', en: 'New Registration' },
  { hi: 'पंजीकरण नवीनीकरण', en: 'Renew Registration' },
  { hi: 'लाइसेंस डाउनलोड', en: 'Download License' },
  { hi: 'प्रश्न और प्रतिक्रिया', en: 'Query & Feedback' },
];

// Navigation items specifically for Admin role with translations
const adminNavItems = [
   { hi: 'होम', en: 'Home' } ,
  { hi: 'लाइसेंस', en: 'Licenses' },
  { hi: 'लाइसेंस जोड़ें', en: 'Add License' },
  { hi: 'लाइसेंस सत्यापित करें', en: 'Verify License' }
   // Added home for admin
];

// Text content for other parts of the navbar
const textContent = {
  en: {
    logoText: 'Nagar Nigam Gorakhpur',
    login: 'Login',
    logout: 'Logout',
    noNotifications: 'No notifications',
  },
  hi: {
    logoText: 'नगर निगम गोरखपुर',
    login: 'लॉग इन करें',
    logout: 'लॉग आउट करें',
    noNotifications: 'कोई सूचना नहीं',
  }
};


function Navbar({ languageType = 'en', user, notifications = [], onLogout, setLanguageType }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const navigate = useNavigate();
  const notifRef = useRef(null); // Ref for notification dropdown
  const menuRef = useRef(null); // Ref for the mobile menu container
  const hamburgerRef = useRef(null); // Ref for the hamburger button

  // Determine which set of nav items to use
  const currentNavItems = user?.role === 'admin' ? adminNavItems : userNavItems;

  // Helper function to get the label in the current language
  const label = (item) => languageType === 'hi' ? item.hi : item.en;

  // Get the current text content based on languageType
  const currentText = textContent[languageType] || textContent.en; // Default to English

  // Effect to close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      // Close notification dropdown if click is outside notifRef
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }

      // Close mobile menu if click is outside menuRef AND outside hamburgerRef
      // Only applies if the menu is currently shown
      if (showMenu && menuRef.current && !menuRef.current.contains(event.target) &&
          hamburgerRef.current && !hamburgerRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    // Add event listener for mousedown clicks on the document
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup function to remove the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu, showNotif]); // Depend on showMenu and showNotif to re-run effect when they change


  // Function to handle navigation item clicks
  // Note: Using item.en for the switch case as routes are likely English strings
  const handleNavItemClick = (englishLabel) => {
    switch (englishLabel) {
      case 'Home':
        navigate('/home');
        break;
      case 'New Registration':
        navigate('/pet-register');
        break;
      case 'Renew Registration':
        navigate('/renew-register');
        break;
      case 'Download License':
        navigate('/download-license');
        break;
      case 'Query & Feedback':
        navigate('/feedback');
        break;
      // Admin specific routes
      case 'Licenses':
        navigate('/admin/license'); // Assuming this is the admin route
        break;
      case 'Add License':
        navigate('/admin/add-license'); 
        break;  
       case 'Home':
        navigate('/admin/home'); 
        break;  

      case 'Verify License':
        navigate('/admin/verify-license'); // Assuming this is the admin route
        break;
      default:
        console.warn('Unhandled nav item:', englishLabel);
    }
    // Close the menu after navigating
    setShowMenu(false);
  };

  // Function to toggle the mobile menu visibility
  const toggleMenu = () => {
    setShowMenu(!showMenu);
    // Close notification dropdown when opening/closing the menu
    setShowNotif(false);
  };

  return (
    <nav className="navbar navbar--gov">
      <div className="navbar__container">
        {/* Top Row */}
        <div className="navbar__top-row">
          {/* Hamburger button with ref */}
          <button
            ref={hamburgerRef} // Attach ref to hamburger button
            className={`hamburger ${showMenu ? 'active' : ''}`}
            aria-label={languageType === 'hi' ? 'मेनू टॉगल करें' : 'Toggle menu'} // Translate ARIA label
            onClick={toggleMenu} // Use the toggleMenu function
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className="navbar__logo">
            <img src="/logo.webp" alt="Logo" className="navbar__logo-img" />
            <span className="gov-logo">{currentText.logoText}</span>
          </div>

          <div className="navbar__actions">
            {/* Language toggle and notifications always together */}
            <div className="navbar__controls">
              <div className="lang-toggle-container">
                <button className="lang-toggle" aria-label={languageType === 'hi' ? 'भाषा बदलें' : 'Toggle language'}>
                  <span
                    className={languageType === 'hi' ? 'active' : ''}
                    onClick={() => setLanguageType('hi')}
                  >अ</span>
                  <span>/</span>
                  <span
                    className={languageType === 'en' ? 'active' : ''}
                    onClick={() => setLanguageType('en')}
                  >A</span>
                </button>
              </div>

              {user && (
                <div className="notif" ref={notifRef}>
                  <button
                    className="notif__icon-btn"
                    aria-label={languageType === 'hi' ? 'सूचनाएं' : 'Notifications'} // Translate ARIA label
                    onClick={() => setShowNotif(!showNotif)}
                  >
                    <Bell size={20} />
                    {notifications.length > 0 && <span className="notif__badge">{notifications.length}</span>}
                  </button>
                  {showNotif && (
                    <ul className="notif__dropdown">
                      {notifications.length > 0
                        ? notifications.map((n, i) => <li key={i} className="notif__item">{n}</li>)
                        : <li className="notif__empty">{currentText.noNotifications}</li>} {/* Dynamic "No notifications" text */}
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
                  ? <button className="btn btn--gov" onClick={() => { setShowMenu(false); onLogout(); }}>{currentText.logout}</button>
                  : <button className="btn btn--gov" onClick={() => { setShowMenu(false); navigate('/login'); }}>{currentText.login}</button>}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu with ref */}
        <div className={`navbar__mobile-menu ${showMenu ? 'show' : ''}`} ref={menuRef}>
          <ul className="navbar__menu">
            {currentNavItems.map((item, idx) => ( // Use currentNavItems
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
                ? <button className="btn btn--gov" onClick={() => { setShowMenu(false); onLogout(); }}>{currentText.logout}</button>
                : <button className="btn btn--gov" onClick={() => { setShowMenu(false); navigate('/login'); }}>{currentText.login}</button>
              }
            </li>
          </ul>
        </div>
        {/* Desktop bottom row for navigation items */}
        <div className='navbar__desktop-only'>
          {user && ( // Only show bottom row if user is logged in
            <div className="navbar__bottom-row">
              <ul className="navbar__menu"> {/* This menu is only shown on desktop */}
                {currentNavItems.map((item, idx) => ( // Use currentNavItems
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