import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Axios from 'axios';
import '../css/signup.css';

function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  Axios.defaults.withCredentials = true;

  const handleSubmit = (e) => {
    e.preventDefault();
    Axios.post('http://localhost:5000/auth/login', { email, password })

      .then(response => {
        if (response.data.status) {
          navigate('/');
        }
        console.log(response);
      })
      .catch(err => {
        console.log(err);
      });
  }

  return (
    <div className='sign-up-container'>
      <h2>Login</h2>
      <form className='sign-up-form' onSubmit={handleSubmit}>


        <label htmlFor="email">Email</label>
        <input type="email" autoComplete='off' placeholder='Email' onChange={(e) => setEmail(e.target.value)} />

        <label htmlFor="password">Password</label>
        <input type="password" placeholder='*****' onChange={(e) => setPassword(e.target.value)} />

        <button type='submit'>Login</button>
        <p>DONT HAVE AN ACCOUNT? <Link to="/signup">Sign up</Link></p>
        <p>Forgot Password? <Link to="/forgotpassword">click here</Link></p>
      </form>
    </div>
  );
}

export default Login;