import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import axios from "axios";

import Navbar from './components/Navbar';
import PetHome from './components/Home/Pethome';
import LoginPage from './components/LoginPage';
import PetRegistration from './components/PetRegistration';
import Profile from './components/Profile';
import DownloadLicense from './components/Download';
import QueryFeedback from './components/FeedBack';
import RenewRegistration from './components/RenewRegistration';
import AdminPanel from "./components/AdminPanel";
import Footer from './components/Footer';
function App() {
  const [languageType, setLanguageType] = useState("en");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogin = (userData, token) => {
    localStorage.setItem("token", token);
    setUser(userData);
    navigate("/");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    navigate("/login");
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
          headers: { Authorization: `Bearer ${token}` },
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

  if (loading) return <div>Loading...</div>;
  console.log("Current user:", user);


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
          
          <Route
            path="/login"
            element={!user?<LoginPage onLogin={handleLogin} setUser={setUser} />: <Navigate to="/" />}
          />
          <Route
            path="/"
            element={ <PetHome /> }
          />
          <Route
            path="/home"
            element={<PetHome /> }
          />
           <Route
            path="/download-license"
            element={user ? <DownloadLicense /> : <Navigate to="/login" />}
          
          />
          <Route
            path="/feedback"
            element={user ? <QueryFeedback /> : <Navigate to="/login" />}
          
          />
          <Route
            path="/pet-register"
            element={user ? <PetRegistration /> : <Navigate to="/login" />}
          />
           <Route
            path="/renew-register"
            element={user ? <RenewRegistration /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" />}
          />

          <Route
            path="/admin"
            element={user && user.role === "admin" ? <AdminPanel /> : <Navigate to="/login" />}
          />

          
        </Routes>
         <Footer />
      </div>
   
  );
}

export default App;
