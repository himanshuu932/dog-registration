import React, { useState, useEffect } from "react";
    import axios from "axios";
    import "./LoginPage.css";

    import PhoneInput from 'react-phone-number-input';
    import 'react-phone-number-input/style.css';
    import { isValidPhoneNumber } from 'react-phone-number-input';
    import { useNavigate } from "react-router-dom";
    import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
    import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

    function LoginPage({ user, setUser }) {
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
          navigate("/home");
        } catch (err) {
          setError(err.response?.data?.message || "Login failed");
        } finally {
          setLoading(false);
        }
      };

      const handleSendOtp = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (method === "phone" && !isValidPhoneNumber(phoneNumber)) {
          setError("Please enter a valid phone number");
          return;
        }
        if (method === "email" && !email) {
          setError("Please enter a valid email address");
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
          setSuccess("OTP sent successfully!");
        } catch (err) {
          setError(err.response?.data?.message || "Failed to send OTP");
        } finally {
          setLoading(false);
        }
      };

      const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!otp) {
          setError("Please enter the OTP");
          return;
        }
        if (!signupUsername) {
          setError("Please choose a username");
          return;
        }
        if (!signupPassword) {
          setError("Please choose a password");
          return;
        }
        if (method === "email" && !isValidPhoneNumber(signupPhoneNumber)) {
          setError("Please enter a valid phone number");
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

          setSuccess("Signup successful! You can now log in.");
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
          setError(err.response?.data?.message || "Invalid OTP or failed signup");
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
          <div className="login-left">
            <img src='./d.jpg' alt="Cute Pet" className="doggy" />
          </div>
          <div className="login-right">
            <div className="login-box">
              {/* Back Button - Always Visible */}
              <button
                onClick={() => navigate("/")}
                className="back-button"
              >
                <FontAwesomeIcon icon={faArrowLeft} /> Back
              </button>

              <img src='./logo.png' alt="Nagar Nigam Logo" className="logo" />
              <h2>Municipal Corporation Gorakhpur</h2>
              <h3>Pet Registration Portal</h3>

              <div className="tab-buttons">
                <button
                  onClick={() => {
                    setView("login");
                    resetForm();
                  }}
                  className={view === "login" ? "active-tab" : ""}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setView("signup");
                    resetForm();
                  }}
                  className={view === "signup" ? "active-tab" : ""}
                >
                  Signup
                </button>
              </div>

              {view === "login" && (
                <form className="login-form" onSubmit={handleLogin}>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />

                  {error && <div className="error-message">{error}</div>}
                  {success && <div className="success-message">{success}</div>}

                  <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </button>

                  <div className="links">
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      setView("signup");
                      resetForm();
                    }}>Create Account</a>
                    <a href="#" onClick={(e) => e.preventDefault()}>Forgot Password?</a>
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
                          Phone
                        </label>
                        <label>
                          <input
                            type="radio"
                            value="email"
                            checked={method === "email"}
                            onChange={() => setMethod("email")}
                          />
                          <span className="checkmark"></span>
                          Email
                        </label>
                      </div>

                      {method === "phone" ? (
                        <PhoneInput
                          placeholder="Enter phone number"
                          value={phoneNumber}
                          onChange={setPhoneNumber}
                          defaultCountry="IN"
                          international
                        />
                      ) : (
                        <input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                        />
                      )}

                      {error && <div className="error-message">{error}</div>}
                      {success && <div className="success-message">{success}</div>}

                      <button onClick={handleSendOtp} disabled={loading}>
                        {loading ? "Sending OTP..." : "Send OTP"}
                      </button>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <input
                        placeholder="OTP"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                      />
                      <input
                        placeholder="Name"
                        value={signupUsername}
                        onChange={e => setSignupUsername(e.target.value)}
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        value={signupPassword}
                        onChange={e => setSignupPassword(e.target.value)}
                      />

                      {method === "email" && (
                        <PhoneInput
                          placeholder="Enter phone number"
                          value={signupPhoneNumber}
                          onChange={setSignupPhoneNumber}
                          defaultCountry="IN"
                          international
                        />
                      )}

                      {error && <div className="error-message">{error}</div>}
                      {success && <div className="success-message">{success}</div>}

                      <button onClick={handleVerifyOtp} disabled={loading}>
                        {loading ? "Verifying..." : "Verify OTP & Signup"}
                      </button>

                      <div className="links">
                        <a href="#" onClick={(e) => {
                          e.preventDefault();
                          setStep(1);
                          setError("");
                          setSuccess("");
                        }}>Go Back</a>
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