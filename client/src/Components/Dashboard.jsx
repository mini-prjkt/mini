import axios from 'axios'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
    const navigate = useNavigate()
    
    useEffect(() => {
      axios.defaults.withCredentials = true;
        axios.get('http://localhost:5000/auth/verify')
        .then(res=> {
            if(res.data.status) {
              
            } else {
                navigate('/')
            }
            console.log(res)
        })
    }, [])
  return (
    <div>Dashboard</div>
  )
}

export default Dashboard