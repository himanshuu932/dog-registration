import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import PetHome from './components/Pethome';
import LoginSignup from './components/LoginPage';
import Profile from './components/Profile';
import axios from 'axios';

function App() {
  const [languageType, setLanguageType] = useState('en');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  const handleLanguageChange = (lang) => {
    setLanguageType(lang);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  return (
    <BrowserRouter>
      <div className="App">
        <Navbar
          languageType={languageType}
          user={user}
          onLogout={handleLogout}
          onLanguageChange={handleLanguageChange}
        />

        <Routes>
          <Route
            path="/"
            element={user ? <PetHome /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={<LoginSignup user={user} setUser={setUser} />}
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;