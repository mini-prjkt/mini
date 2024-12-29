import React, { useState } from "react";
import "../css/login.css";
import Axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  Axios.defaults.withCredentials = true;
  const handleSubmit = (e) => {
    e.preventDefault();
    Axios.post("http://localhost:5000/auth/login", {
      email,
      password,
    })
      .then((response) => {
        if (response.data.status) {
          navigate("/interest");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="main-login">
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="login-heading">Login</h2>

        <div className="login-field">
          <label htmlFor="email" className="login-label">Email:</label>
          <input
            type="email"
            id="email"
            className="login-input"
            autoComplete="off"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="login-field">
          <label htmlFor="password" className="login-label">Password:</label>
          <input
            type="password"
            id="password"
            className="login-input"
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="login-button">Login</button>

        <div className="login-links">
          <Link to="/forgotPassword" className="forgot-password-link">Forgot Password?</Link>
          <p className="signup-link-text">
            Don't have an account? <Link to="/signup" className="signup-link">Sign Up</Link>
          </p>
        </div>
      </form>
    </div>
    </div>
  );
};

export default Login;
