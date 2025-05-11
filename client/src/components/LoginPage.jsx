import React, { useState } from "react";
import axios from "axios";
import "./styles/LoginPage.css";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { useNavigate } from "react-router-dom";
function LoginSignup({ user, setUser }) {
  const [view, setView] = useState("login"); // "login" or "signup"
  const navigate = useNavigate();
  // Shared
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Signup State
  const [method, setMethod] = useState("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPhoneNumber, setSignupPhoneNumber] = useState("");
  const [step, setStep] = useState(1);

  const formatPhoneNumber = (number) => {
    // Returns the phone number in E.164 format (e.g., "+911234567890")
    return number ? number.toString() : "";
  };

const handleLogin = async () => {
  setError("");
  setLoading(true);
  try {
    const res = await axios.post(
      "http://localhost:5000/api/auth/login",
      {
        username,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json", // Ensure this is sent
        },
        withCredentials: true, // Only needed if cookies or auth headers are involved
      }
    );
    
    console.log("Login response:", res.data); // Debug log
    const data = res.data;
   const token = data.token;
  
    localStorage.setItem("token", token);
    setUser(res.data.user);
   // Debug log
    navigate("/home");

  } catch (err) {
    console.error("Login Error:", err);
    setError(err.response?.data?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};


  const handleSendOtp = async () => {
    setError("");
    
    // Validate inputs based on method
    if (method === "phone" && (!phoneNumber || !isValidPhoneNumber(phoneNumber))) {
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
        await axios.post("http://localhost:5000/api/auth/send-otp", { 
          phone: formatPhoneNumber(phoneNumber) 
        });
      } else {
        await axios.post("http://localhost:5000/api/auth/send-email-otp", { 
          email 
        });
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

const handleVerifyOtp = async () => {
  setError("");
  
  // Validate all required fields
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
  if (method === "email" && (!signupPhoneNumber || !isValidPhoneNumber(signupPhoneNumber))) {
    setError("Please enter a valid phone number");
    return;
  }

  setLoading(true);
  try {
    // Base payload for both methods
    const payload = {
      otp,
      username: signupUsername,
      password: signupPassword,
    };

    // For phone method signup
    if (method === "phone") {
      payload.phone = formatPhoneNumber(phoneNumber);
      console.log("Phone signup payload:", payload); // Debug log
      await axios.post("http://localhost:5000/api/auth/verify-otp", payload);
    } 
    // For email method signup
    else {
      payload.email = email;
      payload.phone = formatPhoneNumber(signupPhoneNumber);
      console.log("Email signup payload:", payload); // Debug log
      await axios.post("http://localhost:5000/api/auth/verify-email-otp", payload);
    }
    
    alert("Signup successful! You can now log in.");
    setView("login");
    // Reset form
    setPhoneNumber("");
    setEmail("");
    setOtp("");
    setSignupUsername("");
    setSignupPassword("");
    setSignupPhoneNumber("");
    setStep(1);
  } catch (err) {
    console.error("Signup error:", err.response?.data); // Debug log
    setError(err.response?.data?.message || "Invalid OTP or failed signup");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="login-container">
      <div className="tab-buttons">
        <button
          onClick={() => setView("login")}
          className={view === "login" ? "active-tab" : ""}
        >
          Login
        </button>
        <button
          onClick={() => setView("signup")}
          className={view === "signup" ? "active-tab" : ""}
        >
          Signup
        </button>
      </div>

      {view === "login" && (
        <>
          <h2>Login to Sewa Bharti Goraksh</h2>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
          {error && <div className="error-message">{error}</div>}
          <button onClick={handleLogin} disabled={loading} className="login-button">
            {loading ? "Logging in..." : "Login"}
          </button>
        </>
      )}

      {view === "signup" && (
        <>
          <h2>Signup</h2>
          <div className="form-group">
            <label>
              <input
                type="radio"
                value="phone"
                checked={method === "phone"}
                onChange={() => setMethod("phone")}
              />
              Phone
            </label>
            <label>
              <input
                type="radio"
                value="email"
                checked={method === "email"}
                onChange={() => setMethod("email")}
              />
              Email
            </label>
          </div>

          {step === 1 && (
            <>
              {method === "phone" ? (
                <div className="phone-input-container">
                  <PhoneInput
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={setPhoneNumber}
                    defaultCountry="IN"
                    className="phone-input"
                  />
                </div>
              ) : (
                <input
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                />
              )}
              {error && <div className="error-message">{error}</div>}
              <button onClick={handleSendOtp} disabled={loading} className="login-button">
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <input
                placeholder="OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="input-field"
              />
              <input
                placeholder="Username"
                value={signupUsername}
                onChange={(e) => setSignupUsername(e.target.value)}
                className="input-field"
              />
              <input
                placeholder="Password"
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="input-field"
              />
              {method === "email" && (
                <div className="phone-input-container">
                  <PhoneInput
                    placeholder="Enter phone number"
                    value={signupPhoneNumber}
                    onChange={setSignupPhoneNumber}
                    defaultCountry="IN"
                    className="phone-input"
                  />
                </div>
              )}
              {error && <div className="error-message">{error}</div>}
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="login-button"
              >
                {loading ? "Verifying..." : "Verify OTP and Signup"}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default LoginSignup;