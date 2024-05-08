import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importing Link and useNavigate
import Axios from 'axios'; // Make sure Axios is installed and imported

function ForgotPassword() {

  const [email, setEmail] = useState('');
  const navigate = useNavigate(); // Using useNavigate hook to navigate

  const handleSubmit = (e) => {
    e.preventDefault();
    // Assuming you want to send username and email for password recovery
    Axios.post('http://localhost:5000/auth/forgotpassword', { email })
      .then(response => {
        if (response.data.status) {
          alert("check your mail for reset password link")
          navigate('/login');
        }
        
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <div className='sign-up-container'>
      <form className='sign-up-form' onSubmit={handleSubmit}>
        <h2>Forgot Password??</h2>
        
        <label htmlFor="email">Email</label>
        <input type="email" autoComplete='off' placeholder='Email' onChange={(e) => setEmail(e.target.value)} />

        <button type='submit'>Send</button> {/* Changed button text to 'Submit' */}
        <p>Remember your password? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}

export default ForgotPassword;
