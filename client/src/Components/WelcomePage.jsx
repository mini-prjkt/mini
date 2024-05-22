import React, { useEffect } from 'react'
import axios from "axios";
import { useNavigate } from 'react-router-dom'
import Header from '../header/Header';


function WelcomePage() {
  const navigate = useNavigate()
  axios.defaults.withCredentials = true;
  useEffect(() => {
    axios.get('http://localhost:5000/auth/verify')
      .then(res => {
        if (res.data.status) {

        } else {
          navigate('/')
        }
        console.log(res)
      })
  }, [])
  return (
    <div className='outer-div'>
      <Header />
      
    </div>
  )
}

export default WelcomePage
