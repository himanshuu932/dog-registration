import React, { useState, useEffect } from "react";
import axios from "axios";
import "./LoginPage.css";

import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

// Translations object
const translations = {
  en: {
    municipalCorporation: "Municipal Corporation Gorakhpur",
    petRegistrationPortal: "Pet Registration Portal",
    login: "Login",
    signup: "Signup",
    username: "Username",
    password: "Password",
    loginFailed: "Login failed",
    loggingIn: "Logging in...",
    createAccount: "Create Account",
    forgotPassword: "Forgot Password?",
    phone: "Phone",
    email: "Email",
    enterPhoneNumber: "Enter phone number",
    enterEmail: "Email",
    invalidPhoneNumber: "Please enter a valid phone number",
    invalidEmail: "Please enter a valid email address",
    sendingOtp: "Sending OTP...",
    sendOtp: "Send OTP",
    otpSentSuccess: "OTP sent successfully!",
    otp: "OTP",
    name: "Name",
    chooseUsername: "Please choose a username",
    choosePassword: "Please choose a password",
    enterPhoneNumberSignup: "Enter phone number", // For email signup step 2
    invalidOtpOrSignupFailed: "Invalid OTP or failed signup",
    verifying: "Verifying...",
    verifyOtpAndSignup: "Verify OTP & Signup",
    signupSuccessful: "Signup successful! You can now log in.",
    goBack: "Go Back",
    back: "Back"
  },
  hi: {
    municipalCorporation: "नगर निगम गोरखपुर",
    petRegistrationPortal: "पालतू पशु पंजीकरण पोर्टल",
    login: "लॉग इन करें",
    signup: "साइन अप करें",
    username: "यूज़रनेम",
    password: "पासवर्ड",
    loginFailed: "लॉग इन विफल रहा",
    loggingIn: "लॉग इन हो रहा है...",
    createAccount: "खाता बनाएं",
    forgotPassword: "पासवर्ड भूल गए?",
    phone: "फ़ोन",
    email: "ईमेल",
    enterPhoneNumber: "फ़ोन नंबर दर्ज करें",
    enterEmail: "ईमेल दर्ज करें",
    invalidPhoneNumber: "कृपया मान्य फ़ोन नंबर दर्ज करें",
    invalidEmail: "कृपया मान्य ईमेल पता दर्ज करें",
    sendingOtp: "ओटीपी भेज रहा है...",
    sendOtp: "ओटीपी भेजें",
    otpSentSuccess: "ओटीपी सफलतापूर्वक भेजा गया!",
    otp: "ओटीपी",
    name: "नाम",
    chooseUsername: "कृपया यूज़रनेम चुनें",
    choosePassword: "कृपया पासवर्ड चुनें",
    enterPhoneNumberSignup: "फ़ोन नंबर दर्ज करें", // For email signup step 2
    invalidOtpOrSignupFailed: "अमान्य ओटीपी या साइन अप विफल रहा",
    verifying: "सत्यापित हो रहा है...",
    verifyOtpAndSignup: "ओटीपी सत्यापित करें और साइन अप करें",
    signupSuccessful: "साइन अप सफल! अब आप लॉग इन कर सकते हैं।",
    goBack: "वापस जाएं",
    back: "वापस"
  }
};

function LoginPage({ user, setUser, languageType }) {
  const [view, setView] = useState("login");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Still tracking, but not used for button visibility

  // Login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Signup state
  const [method, setMethod] = useState("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPhoneNumber, setSignupPhoneNumber] = useState("");
  const [step, setStep] = useState(1);

  const backend = "https://dog-registration.onrender.com";

  const formatPhoneNumber = (number) => number ? number.toString() : "";

  // Get translations based on languageType
  const t = translations[languageType] || translations.en;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await axios.post(
        `${backend}/api/auth/login`,
        { username, password },
        { withCredentials: true }
      );
      const { token, user: loggedUser } = res.data;
      localStorage.setItem("token", token);
      setUser(loggedUser);

      // Redirect based on user role
      if (loggedUser.role === "admin") {
        navigate("/");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(err.response?.data?.message || t.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (method === "phone" && !isValidPhoneNumber(phoneNumber)) {
      setError(t.invalidPhoneNumber);
      return;
    }
    if (method === "email" && !email) {
      setError(t.invalidEmail);
      return;
    }

    setLoading(true);
    try {
      if (method === "phone") {
        await axios.post(`${backend}/api/auth/send-otp`, { phone: formatPhoneNumber(phoneNumber) });
      } else {
        await axios.post(`${backend}/api/auth/send-email-otp`, { email });
      }
      setStep(2);
      setSuccess(t.otpSentSuccess);
    } catch (err) {
      setError(err.response?.data?.message || t.invalidOtpOrSignupFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp) {
      setError(t.otp); // Assuming "OTP" as error message for empty OTP
      return;
    }
    if (!signupUsername) {
      setError(t.chooseUsername);
      return;
    }
    if (!signupPassword) {
      setError(t.choosePassword);
      return;
    }
    if (method === "email" && !isValidPhoneNumber(signupPhoneNumber)) {
      setError(t.invalidPhoneNumber);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        otp,
        username: signupUsername,
        password: signupPassword
      };

      if (method === "phone") {
        payload.phone = formatPhoneNumber(phoneNumber);
        await axios.post(`${backend}/api/auth/verify-otp`, payload);
      } else {
        payload.email = email;
        payload.phone = formatPhoneNumber(signupPhoneNumber);
        await axios.post(`${backend}/api/auth/verify-email-otp`, payload);
      }

      setSuccess(t.signupSuccessful);
      setTimeout(() => {
        setView("login");
        setStep(1);
        // Reset signup fields
        setPhoneNumber("");
        setEmail("");
        setOtp("");
        setSignupUsername("");
        setSignupPassword("");
        setSignupPhoneNumber("");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || t.invalidOtpOrSignupFailed);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setError("");
    setSuccess("");
    setStep(1);
  };

  return (
    <div className="login-wrapper">
      {/* Left side for desktop */}
      {!isMobile &&(<div className="login-left">
        <img src='./dog1.webp' alt="Cute Pet" className="doggy" />
      </div>)
      }
      <div className="login-right">
        <div className="login-box">
          {/* Back Button - Always Visible */}
          <button
            onClick={() => navigate("/")}
            className="back-button"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> {t.back}
          </button>

          <img src='/logo.webp' alt="Nagar Nigam Logo" className="logo" />
          <h2>{t.municipalCorporation}</h2>
          <h3>{t.petRegistrationPortal}</h3>

          <div className="tab-buttons">
            <button
              onClick={() => {
                setView("login");
                resetForm();
              }}
              className={view === "login" ? "active-tab" : ""}
            >
              {t.login}
            </button>
            <button
              onClick={() => {
                setView("signup");
                resetForm();
              }}
              className={view === "signup" ? "active-tab" : ""}
            >
              {t.signup}
            </button>
          </div>

          {view === "login" && (
            <form className="login-form" onSubmit={handleLogin}>
              <input
                type="text"
                placeholder={t.username}
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder={t.password}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <button type="submit" disabled={loading}>
                {loading ? t.loggingIn : t.login}
              </button>

              <div className="links">
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  setView("signup");
                  resetForm();
                }}>{t.createAccount}</a>
                <a href="#" onClick={(e) => e.preventDefault()}>{t.forgotPassword}</a>
              </div>
            </form>
          )}

          {view === "signup" && (
            <div className="signup-form">
              {step === 1 && (
                <>
                  <div className="form-group-login">
                    <label>
                      <input
                        type="radio"
                        value="phone"
                        checked={method === "phone"}
                        onChange={() => setMethod("phone")}
                      />
                      <span className="checkmark"></span>
                      {t.phone}
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="email"
                        checked={method === "email"}
                        onChange={() => setMethod("email")}
                      />
                      <span className="checkmark"></span>
                      {t.email}
                    </label>
                  </div>

                  {method === "phone" ? (
                    <PhoneInput
                      placeholder={t.enterPhoneNumber}
                      value={phoneNumber}
                      onChange={setPhoneNumber}
                      defaultCountry="IN"
                      international
                    />
                  ) : (
                    <input
                      type="email"
                      placeholder={t.enterEmail}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  )}

                  {error && <div className="error-message">{error}</div>}
                  {success && <div className="success-message">{success}</div>}

                  <button onClick={handleSendOtp} disabled={loading}>
                    {loading ? t.sendingOtp : t.sendOtp}
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <input
                    placeholder={t.otp}
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                  />
                  <input
                    placeholder={t.name}
                    value={signupUsername}
                    onChange={e => setSignupUsername(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder={t.password}
                    value={signupPassword}
                    onChange={e => setSignupPassword(e.target.value)}
                  />

                  {method === "email" && (
                    <PhoneInput
                      placeholder={t.enterPhoneNumberSignup}
                      value={signupPhoneNumber}
                      onChange={setSignupPhoneNumber}
                      defaultCountry="IN"
                      international
                    />
                  )}

                  {error && <div className="error-message">{error}</div>}
                  {success && <div className="success-message">{success}</div>}

                  <button onClick={handleVerifyOtp} disabled={loading}>
                    {loading ? t.verifying : t.verifyOtpAndSignup}
                  </button>

                  <div className="links">
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      setStep(1);
                      setError("");
                      setSuccess("");
                    }}>{t.goBack}</a>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;