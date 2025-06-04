import React, { useState, useEffect, useRef } from 'react';
import './styles/Navbar.css';
import { Bell, UserCircle, Edit3, Save, X as CloseIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Navigation items for regular users with translations
const userNavItems = [
  { hi: 'होम', en: 'Home', path: '/home' },
  { hi: 'नई पंजीकरण', en: 'New Registration', path: '/pet-register' },
  { hi: 'पंजीकरण नवीनीकरण', en: 'Renew Registration', path: '/renew-register' },
  { hi: 'लाइसेंस डाउनलोड', en: 'Download License', path: '/download-license' },
  { hi: 'प्रश्न और प्रतिक्रिया', en: 'Query & Feedback', path: '/feedback' },
];

// Navigation items specifically for Admin role with translations
const adminNavItems = [
  { hi: 'होम', en: 'Home', path: '/admin/home' },
  { hi: 'लाइसेंस', en: 'Licenses', path: '/admin/license' },
  { hi: 'लाइसेंस जोड़ें', en: 'Add License', path: '/admin/add-license' },
  { hi: 'लाइसेंस सत्यापित करें', en: 'Verify License', path: '/admin/verify-license' },
];

// Text content for other parts of the navbar
const textContent = {
  en: {
    logoText: 'Nagar Nigam Gorakhpur',
    login: 'Login',
    logout: 'Logout',
    noNotifications: 'No notifications',
    profile: 'Profile',
    editProfile: 'Edit Profile',
    save: 'Save',
    cancel: 'Cancel',
    nameLabel: 'Username',
    email: 'Email',
    role: 'Role',
    phone: 'Phone',
    updateSuccess: 'Profile updated successfully!',
    updateError: 'Failed to update profile.',
    fieldCannotBeChanged: '(cannot be changed)',
  },
  hi: {
    logoText: 'नगर निगम गोरखपुर',
    login: 'लॉग इन करें',
    logout: 'लॉग आउट करें',
    noNotifications: 'कोई सूचना नहीं',
    profile: 'प्रोफ़ाइल',
    editProfile: 'प्रोफ़ाइल संपादित करें',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    nameLabel: 'उपयोगकर्ता नाम',
    email: 'ईमेल',
    role: 'भूमिका',
    phone: 'फ़ोन',
    updateSuccess: 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!',
    updateError: 'प्रोफ़ाइल अपडेट करने में विफल।',
    fieldCannotBeChanged: '(बदला नहीं जा सकता)',
  }
};

const backend = "https://dog-registration.onrender.com";

// Added setUser to the props destructuring
function Navbar({ languageType = 'en', user, notifications = [], onLogout, setLanguageType, setUser }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfilePopover, setShowProfilePopover] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editableUsername, setEditableUsername] = useState(user?.username || '');
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  const navigate = useNavigate();
  const notifRef = useRef(null);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const profilePopoverRef = useRef(null);
  const userDisplayRef = useRef(null);

  const currentNavItems = user?.role === 'admin' ? adminNavItems : userNavItems;
  const label = (item) => languageType === 'hi' ? item.hi : item.en;
  const currentText = textContent[languageType] || textContent.en;

  useEffect(() => {
    if (user) {
      setEditableUsername(user.username || '');
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
      if (showMenu && menuRef.current && !menuRef.current.contains(event.target) &&
          hamburgerRef.current && !hamburgerRef.current.contains(event.target)) {
        setShowMenu(false);
      }
      if (profilePopoverRef.current && !profilePopoverRef.current.contains(event.target) &&
          userDisplayRef.current && !userDisplayRef.current.contains(event.target)) {
        setShowProfilePopover(false);
        setIsEditingProfile(false);
        setProfileMessage({ type: '', text: '' });
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu, showNotif, showProfilePopover]);


  const handleNavItemClick = (item) => {
    navigate(item.path);
    setShowMenu(false);
    setShowProfilePopover(false);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
    setShowNotif(false);
    setShowProfilePopover(false);
  };

  const toggleProfilePopover = () => {
    setShowProfilePopover(!showProfilePopover);
    setIsEditingProfile(false);
    setProfileMessage({ type: '', text: '' });
    if (user && !showProfilePopover) {
      setEditableUsername(user.username || '');
    }
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setProfileMessage({ type: '', text: '' });
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    if (user) setEditableUsername(user.username || '');
    setProfileMessage({ type: '', text: '' });
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setProfileMessage({ type: 'error', text: 'Authentication token not found.' });
      onLogout();
      return;
    }

    if (!editableUsername.trim()) {
        setProfileMessage({ type: 'error', text: `${currentText.nameLabel} cannot be empty.` });
        return;
    }

    try {
      const response = await fetch(`${backend}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username: editableUsername }),
      });

      const data = await response.json();

      if (response.ok) {
        setProfileMessage({ type: 'success', text: currentText.updateSuccess });
        setIsEditingProfile(false);
        // Directly use setUser here to update the user state in the parent
        if (setUser && data.user) {
          setUser(data.user);
          // Update localStorage if you store user data there
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        setTimeout(() => {
            setShowProfilePopover(false);
            setProfileMessage({ type: '', text: ''});
        }, 2000);
      } else {
        setProfileMessage({ type: 'error', text: data.message || currentText.updateError });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setProfileMessage({ type: 'error', text: currentText.updateError });
    }
  };

  const handleLogout = () => {
    setShowMenu(false);
    setShowProfilePopover(false);
    onLogout();
  };

  const handleLoginNav = () => {
    setShowMenu(false);
    setShowProfilePopover(false);
    navigate('/login');
  }

  return (
    <nav className="navbar navbar--gov">
      <div className="navbar__container">
        <div className="navbar__top-row">
          <button
            ref={hamburgerRef}
            className={`hamburger ${showMenu ? 'active' : ''}`}
            aria-label={label({ hi: 'मेनू टॉगल करें', en: 'Toggle menu' })}
            onClick={toggleMenu}
          >
            <span></span><span></span><span></span>
          </button>

          <div className="navbar__logo">
            <img src="/logo.webp" alt="Logo" className="navbar__logo-img" />
            <span className="gov-logo">{currentText.logoText}</span>
          </div>

          <div className="navbar__actions">
            <div className="navbar__controls">
              <div className="lang-toggle-container">
                <button className="lang-toggle" aria-label={label({ hi: 'भाषा बदलें', en: 'Toggle language' })}>
                  <span className={languageType === 'hi' ? 'active' : ''} onClick={() => setLanguageType('hi')}>अ</span>
                  <span>/</span>
                  <span className={languageType === 'en' ? 'active' : ''} onClick={() => setLanguageType('en')}>A</span>
                </button>
              </div>

              {user && (
                <div className="notif" ref={notifRef}>
                  <button
                    className="notif__icon-btn"
                    aria-label={label({ hi: 'सूचनाएं', en: 'Notifications' })}
                    onClick={() => setShowNotif(!showNotif)}
                  >
                    <Bell size={20} />
                    {notifications.length > 0 && <span className="notif__badge">{notifications.length}</span>}
                  </button>
                  {showNotif && (
                    <ul className="notif__dropdown">
                      {notifications.length > 0
                        ? notifications.map((n, i) => <li key={i} className="notif__item">{n}</li>)
                        : <li className="notif__empty">{currentText.noNotifications}</li>}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="navbar__desktop-only">
              {user && (
                <div className="navbar__user-section" ref={userDisplayRef}>
                  <button className="navbar__username-btn" onClick={toggleProfilePopover}>
                    <UserCircle size={20} style={{ marginRight: '5px' }} />
                    {user.username}
                  </button>
                  {showProfilePopover && (
                    <div className="profile-popover" ref={profilePopoverRef}>
                      <button className="profile-popover__close" onClick={() => {setShowProfilePopover(false); setIsEditingProfile(false);}}><CloseIcon size={18} /></button>
                      <h4>{currentText.profile}</h4>
                      {profileMessage.text && <p className={`profile-message profile-message--${profileMessage.type}`}>{profileMessage.text}</p>}
                      {!isEditingProfile ? (
                        <>
                          <div className="profile-details">
                            <p><strong>{currentText.nameLabel}:</strong> {user.username}</p>
                            <p><strong>{currentText.email}:</strong> {user.email || 'N/A'} <small>{currentText.fieldCannotBeChanged}</small></p>
                            <p><strong>{currentText.phone}:</strong> {user.phone || 'N/A'} <small>{currentText.fieldCannotBeChanged}</small></p>
                            <p><strong>{currentText.role}:</strong> {user.role} <small>{currentText.fieldCannotBeChanged}</small></p>
                          </div>
                          <button className="btn btn--sm btn--profile-action" onClick={handleEditProfile}>
                            <Edit3 size={16} /> {currentText.editProfile}
                          </button>
                        </>
                      ) : (
                        <div className="profile-edit-form">
                          <div className="form-group">
                            <label htmlFor="profileUsername">{currentText.nameLabel}:</label>
                            <input
                              type="text"
                              id="profileUsername"
                              value={editableUsername}
                              onChange={(e) => setEditableUsername(e.target.value)}
                            />
                          </div>
                          <p><strong>{currentText.email}:</strong> {user.email || 'N/A'} <small>{currentText.fieldCannotBeChanged}</small></p>
                          <p><strong>{currentText.phone}:</strong> {user.phone || 'N/A'} <small>{currentText.fieldCannotBeChanged}</small></p>
                          <p><strong>{currentText.role}:</strong> {user.role} <small>{currentText.fieldCannotBeChanged}</small></p>
                          <div className="profile-edit-actions">
                            <button className="btn btn--sm btn--primary" onClick={handleSaveProfile}>
                              <Save size={16} /> {currentText.save}
                            </button>
                            <button className="btn btn--sm btn--outline" onClick={handleCancelEdit}>
                              {currentText.cancel}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div className="auth-action">
                {user
                  ? <button className="btn btn--gov" onClick={handleLogout}>{currentText.logout}</button>
                  : <button className="btn btn--gov" onClick={handleLoginNav}>{currentText.login}</button>}
              </div>
            </div>
          </div>
        </div>

        <div className={`navbar__mobile-menu ${showMenu ? 'show' : ''}`} ref={menuRef}>
          <ul className="navbar__menu">
            {user && (
              <li className="nav-item nav-item--gov mobile-user-profile-section">
                <div className="mobile-user-info" ref={userDisplayRef} onClick={toggleProfilePopover}>
                    <UserCircle size={20} /> {user.username}
                    <Edit3 size={16} style={{marginLeft: '10px'}}/>
                </div>
                {showProfilePopover && showMenu && (
                     <div className="profile-popover profile-popover--mobile" ref={profilePopoverRef}>
                        <button className="profile-popover__close" onClick={() => {setShowProfilePopover(false); setIsEditingProfile(false);}}><CloseIcon size={18} /></button>
                        <h4>{currentText.profile}</h4>
                        {profileMessage.text && <p className={`profile-message profile-message--${profileMessage.type}`}>{profileMessage.text}</p>}
                        {!isEditingProfile ? (
                        <>
                            <div className="profile-details">
                            <p><strong>{currentText.nameLabel}:</strong> {user.username}</p>
                            <p><strong>{currentText.email}:</strong> {user.email || 'N/A'} <small>{currentText.fieldCannotBeChanged}</small></p>
                            <p><strong>{currentText.phone}:</strong> {user.phone || 'N/A'} <small>{currentText.fieldCannotBeChanged}</small></p>
                            <p><strong>{currentText.role}:</strong> {user.role} <small>{currentText.fieldCannotBeChanged}</small></p>
                            </div>
                            <button className="btn btn--sm btn--profile-action" onClick={handleEditProfile}>
                            <Edit3 size={16} /> {currentText.editProfile}
                            </button>
                        </>
                        ) : (
                        <div className="profile-edit-form">
                            <div className="form-group">
                            <label htmlFor="profileUsernameMobile">{currentText.nameLabel}:</label>
                            <input
                                type="text"
                                id="profileUsernameMobile"
                                value={editableUsername}
                                onChange={(e) => setEditableUsername(e.target.value)}
                            />
                            </div>
                            <p><strong>{currentText.email}:</strong> {user.email || 'N/A'} <small>{currentText.fieldCannotBeChanged}</small></p>
                            <p><strong>{currentText.phone}:</strong> {user.phone || 'N/A'} <small>{currentText.fieldCannotBeChanged}</small></p>
                            <p><strong>{currentText.role}:</strong> {user.role} <small>{currentText.fieldCannotBeChanged}</small></p>
                            <div className="profile-edit-actions">
                            <button className="btn btn--sm btn--primary" onClick={handleSaveProfile}>
                                <Save size={16} /> {currentText.save}
                            </button>
                            <button className="btn btn--sm btn--outline" onClick={handleCancelEdit}>
                                {currentText.cancel}
                            </button>
                            </div>
                        </div>
                        )}
                    </div>
                )}
              </li>
            )}
            {currentNavItems.map((item) => (
              <li
                key={item.en}
                className="nav-item nav-item--gov"
                onClick={() => handleNavItemClick(item)}
              >
                {label(item)}
              </li>
            ))}
            <li className="nav-item nav-item--gov mobile-auth">
              {user
                ? <button className="btn btn--gov" onClick={handleLogout}>{currentText.logout}</button>
                : <button className="btn btn--gov" onClick={handleLoginNav}>{currentText.login}</button>
              }
            </li>
          </ul>
        </div>

        <div className='navbar__desktop-only'>
          {user && (
            <div className="navbar__bottom-row">
              <ul className="navbar__menu">
                {currentNavItems.map((item) => (
                  <li
                    key={item.en}
                    className="nav-item nav-item--gov"
                    onClick={() => handleNavItemClick(item)}
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