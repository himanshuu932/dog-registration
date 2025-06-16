import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./LoginPage.css"; // Ensure this CSS file is correctly linked and updated

import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { RefreshCw } from 'lucide-react'; // Added for CAPTCHA refresh


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
    enterPhoneNumberSignup: "Enter phone number",
    invalidOtpOrSignupFailed: "Invalid OTP or failed signup",
    verifying: "Verifying...",
    verifyOtpAndSignup: "Verify OTP & Signup",
    signupSuccessful: "Signup successful! You can now log in.",
    goBack: "Go Back",
    back: "Back",
    // CAPTCHA specific translations
    enterCaptcha: "Enter CAPTCHA",
    invalidCaptcha: "Invalid CAPTCHA",
    failedToLoadCaptcha: "Failed to load CAPTCHA",
    refreshCaptcha: "Refresh CAPTCHA",
    captchaVerifiedSendingOtp: "CAPTCHA verified. Sending OTP..." // Added for clarity
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
    enterPhoneNumberSignup: "फ़ोन नंबर दर्ज करें",
    invalidOtpOrSignupFailed: "अमान्य ओटीपी या साइन अप विफल रहा",
    verifying: "सत्यापित हो रहा है...",
    verifyOtpAndSignup: "ओटीपी सत्यापित करें और साइन अप करें",
    signupSuccessful: "साइन अप सफल! अब आप लॉग इन कर सकते हैं।",
    goBack: "वापस जाएं",
    back: "वापस",
    // CAPTCHA specific translations
    enterCaptcha: "कैप्चा दर्ज करें",
    invalidCaptcha: "अमान्य कैप्चा",
    failedToLoadCaptcha: "कैप्चा लोड करने में विफल",
    refreshCaptcha: "कैप्चा रीफ़्रेश करें",
    captchaVerifiedSendingOtp: "कैप्चा सत्यापित। ओटीपी भेज रहा है..."
  }
};

const API_DOG_REGISTRATION = "https://dog-registration-yl8x.onrender.com//api";
// const API_KALYANMANDAPAM = "https://kalyanmandapam.onrender.com/api"; // This is the API from LoginPage.jsx, kept separate for clarity if needed.

function LoginPage({ user, setUser, languageType }) {
  const [view, setView] = useState("login");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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

  // CAPTCHA STATES
  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  // Get translations based on languageType
  const t = translations[languageType] || translations.en;

  // Function to load/reload CAPTCHA
  const loadCaptcha = useCallback(() => {
    //setError(""); // Clear general errors when captcha is (re)loaded
    setCaptchaInput(""); // Clear input when new captcha is loaded
    setCaptchaSvg("");   // Clear current SVG while loading
    setCaptchaToken(""); // Clear current token

    axios
      .get(`${API_DOG_REGISTRATION}/captcha/get-captcha`) // Using the API from dog-registration backend
      .then((res) => {
        setCaptchaSvg(res.data.svg);
        setCaptchaToken(res.data.token);
      })
      .catch((err) => {
        console.error("Failed to load CAPTCHA:", err);
        setError(t.failedToLoadCaptcha);
      });
  }, [t]); // languageType for error messages

  useEffect(() => {
    // Only fetch CAPTCHA for login or the first step of signup
    if (view === "login" || (view === "signup" && step === 1)) {
      loadCaptcha();
    }
  }, [view, step, loadCaptcha]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const formatPhoneNumber = (number) => number ? number.toString() : "";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // 1. Verify CAPTCHA first
      const captchaRes = await axios.post(`${API_DOG_REGISTRATION}/captcha/verify-captcha`, {
        captchaInput,
        captchaToken,
      });

      if (!captchaRes.data?.success) {
        throw new Error(t.invalidCaptcha);
      }

      // If CAPTCHA is successful, proceed with user login
      const res = await axios.post(
        `${API_DOG_REGISTRATION}/auth/login`,
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
      setSuccess(t.loginSuccessful); // Assuming you add this to translations
    } catch (err) {
      console.error("Login/CAPTCHA error:", err.response || err.message);
      let errorMessage = t.loginFailed;

      if (err.message === t.invalidCaptcha) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      loadCaptcha(); // Refresh CAPTCHA on error

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
      setLoading(false);
      return;
    }
    if (method === "email" && !email) {
      setError(t.invalidEmail);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Verify CAPTCHA first for signup (step 1)
      const captchaRes = await axios.post(`${API_DOG_REGISTRATION}/captcha/verify-captcha`, {
        captchaInput,
        captchaToken,
      });

      if (!captchaRes.data?.success) {
        throw new Error(t.invalidCaptcha);
      }

      setSuccess(t.captchaVerifiedSendingOtp); // Assuming you add this translation

      // 2. If CAPTCHA is successful, proceed with sending OTP
      if (method === "phone") {
        await axios.post(`${API_DOG_REGISTRATION}/auth/send-otp`, { phone: formatPhoneNumber(phoneNumber) });
      } else {
        await axios.post(`${API_DOG_REGISTRATION}/auth/send-email-otp`, { email });
      }
      setStep(2);
      setSuccess(t.otpSentSuccess);
    } catch (err) {
      console.error("Signup/CAPTCHA error:", err.response || err.message);
      let errorMessage = err.response?.data?.message || t.invalidOtpOrSignupFailed;

      if (err.message === t.invalidCaptcha) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      loadCaptcha(); // Refresh CAPTCHA on error

    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp) {
      setError(t.otp);
      setLoading(false);
      return;
    }
    if (!signupUsername) {
      setError(t.chooseUsername);
      setLoading(false);
      return;
    }
    if (!signupPassword) {
      setError(t.choosePassword);
      setLoading(false);
      return;
    }
    if (method === "email" && !isValidPhoneNumber(signupPhoneNumber)) {
      setError(t.invalidPhoneNumber);
      setLoading(false);
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
        await axios.post(`${API_DOG_REGISTRATION}/auth/verify-otp`, payload);
      } else {
        payload.email = email;
        payload.phone = formatPhoneNumber(signupPhoneNumber);
        await axios.post(`${API_DOG_REGISTRATION}/auth/verify-email-otp`, payload);
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
        setError(""); // Clear error on successful signup
        setSuccess(""); // Clear success on successful signup
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
    // loadCaptcha will be called by useEffect due to step change
  };

  const renderCaptchaFields = () => (
    captchaSvg && ( // Only render if captchaSvg is available
      <div className="captcha-wrapper" style={{ display: "flex", alignItems: "center", gap: "10px" }}> {/* Main container for CAPTCHA elements */}
        <div className="captcha-top-row" style={{ display: "flex", alignItems: "center", flexDirection: "row", gap: "10px" }}> {/* Container for image and refresh button */}
          <div className="captcha-svg-container" dangerouslySetInnerHTML={{ __html: captchaSvg }} />
          <button
            type="button"
            onClick={loadCaptcha} // Assuming loadCaptcha is your function to reload CAPTCHA
            title={t.refreshCaptcha}
            className="refresh-captcha-btn"
            style={{ height: "40px", width: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <RefreshCw size={22} />
          </button>
        </div>
        <input
          type="text"
          placeholder={t.enterCaptcha}
          value={captchaInput}
          onChange={(e) => setCaptchaInput(e.target.value)}
          required
          className="captcha-input-field"
        />
      </div>
    )
  );


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

              {renderCaptchaFields()}

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <button
                type="submit"
                disabled={loading || !captchaToken} // Disable if captcha isn't loaded
                className={loading ? "disabled-login-button" : ""}
              >
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
              {step === 1 ? (
                <form onSubmit={handleSendOtp}>
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

                  {renderCaptchaFields()}

                  {error && <div className="error-message">{error}</div>}
                  {success && <div className="success-message">{success}</div>}

                  <button type="submit" disabled={loading || !captchaToken}>
                    {loading ? t.sendingOtp : t.sendOtp}
                  </button>
                </form>
              ) : ( // Step 2: Verify OTP
                <form onSubmit={handleVerifyOtp}>
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

                  <button type="submit" disabled={loading}>
                    {loading ? t.verifying : t.verifyOtpAndSignup}
                  </button>

                  <p>
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      setStep(1);
                      setError("");
                      setSuccess("");
                    }}>{t.goBack}</a>
                  </p>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;