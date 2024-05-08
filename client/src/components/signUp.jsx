import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Axios from 'axios';
import '../css/signup.css';

function SignUp() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
  
    const handleSubmit = (e) => {
      e.preventDefault();
      Axios.post('http://localhost:5000/auth/signup', { username, email, password }) // Fixed the URL
        .then(response => {
          if (response.data.status) {
            navigate('/login');
          }
          console.log(response);
        })
        .catch(err => {
          console.log(err);
        });
    };
  
    return (
      <div className='sign-up-container'>
        <h2>Sign up</h2>
        <form className='sign-up-form' onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input type="text" placeholder='Username' onChange={(e) => setUsername(e.target.value)} />
  
          <label htmlFor="email">Email</label>
          <input type="email" autoComplete='off' placeholder='Email' onChange={(e) => setEmail(e.target.value)} />
  
          <label htmlFor="password">Password</label>
          <input type="password" placeholder='*****' onChange={(e) => setPassword(e.target.value)} />
  
          <button type='submit'>Sign up</button>
          <p>HAVE AN ACCOUNT? <Link to="/login">Login</Link></p>
        </form>
      </div>
    );
}

export default SignUp;
