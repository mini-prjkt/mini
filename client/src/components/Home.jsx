import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'
function Home() {
  const navigate = useNavigate()
  axios.defaults.withCredentials=true;
  const handlelogout = () => {
    axios.get('http://localhost:5000/auth/logout')
      .then(res => {
        if (res.data.status) {
          navigate('/login')
        }
      }).catch(err=>{
        console.log(err)
      })
  }
  return (
    <div>
      hiiiiiiiiiiiiiiiiiii
      <button><Link to="/dashboard">Dashboard</Link></button>
      <br />
      <button onClick={handlelogout}>Logout</button>
    </div>
  )
}

export default Home
