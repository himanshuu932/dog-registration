// src/App.js
import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Pethome from './components/Pethome';
import LoginPage from './components/LoginPage';
import PetRegistration from './components/Petform';
function App() {
  const [languageType, setLanguageType] = useState('en');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = () => {
    setUser({ name: 'Govind' });
    navigate('/');
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  const handleLanguageChange = (lang) => {
    setLanguageType(lang);
  };

  return (
    <div className="App">
      <Navbar
        languageType={languageType}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onLanguageChange={handleLanguageChange}
      />
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/" element={ <Pethome />  } />
        <Route path="/home" element={ <Pethome />  } />
        <Route path="/pet-register" element={ <PetRegistration />  } />
      </Routes>
    </div>
  );
}

export default App;
