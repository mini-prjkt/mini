import React, { useState } from "react";
import '../css/signup.css'
import Axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
  
    const navigate = useNavigate()
  
    const handleSubmit = (e) => {
      e.preventDefault();
      console.log("Email:", email); // Log the email before making the request
      Axios.post("http://localhost:5000/auth/forgot-password", {
        email,
      })
      .then(response => {
          console.log("Response:", response.data); // Log the response
          if(response.data.status) {
            alert("Check your email for the reset password link");
            navigate('/login');
          }
          
      })
      .catch(err => {
          console.error("Error:", err); // Log any errors
      });
    };
  
  return (
    <div className="sign-up-container">
      <form className="sign-up-form" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          autoComplete="off"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
