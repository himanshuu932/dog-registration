// src/App.js
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PetHome from './components/Pethome';
import LoginPage from './components/LoginPage'; // You should create this component

function App() {
  const [languageType, setLanguageType] = useState('en');
  const [user, setUser] = useState(null); // User state

  const handleLogin = () => {
    setUser({ name: 'Govind' });
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleLanguageChange = (lang) => {
    setLanguageType(lang);
  };

  return (
    <BrowserRouter>
      <div className="App">
        <Navbar
          languageType={languageType}
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onLanguageChange={handleLanguageChange}
        />
        <Routes>
          {!user ? (
            <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
          ) : (
            <Route path="/" element={<PetHome />} />
          )}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
