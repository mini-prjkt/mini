import React, { useEffect } from 'react'
import axios from "axios";
import { useNavigate } from 'react-router-dom'

function Notification() {
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
    <div>
      
    </div>
  )
}

export default Notification
