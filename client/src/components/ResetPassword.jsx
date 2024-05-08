import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Axios from 'axios';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    Axios.post(`http://localhost:5000/auth/resetpassword/${token}`, { password })
      .then(response => {
        if (response.data.status) {
          navigate('/login');
        }
        console.log(response.data);
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <div className='sign-up-container'>
      <form className='sign-up-form' onSubmit={handleSubmit}>
        <h2>Reset Password??</h2>
        <label htmlFor="password">New Password</label>
        <input type="password" placeholder='*****' onChange={(e) => setPassword(e.target.value)} />
        <button type='submit'>reset</button> 
      </form>
    </div>
  );
}

export default ResetPassword;
