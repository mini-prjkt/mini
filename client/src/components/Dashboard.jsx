import React, { useEffect } from 'react'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
//this is a protected route and only logged in user can see this
function Dashboard() {
    const navigate= useNavigate()
    axios.defaults.withCredentials=true;
    useEffect(()=>{
        axios.get('http://localhost:5000/auth/verify')
        .then(res=>{
            if(res.data.status){

            }
            else{
                navigate('/')
            }
        })
    })
  return (
    <div>
      namaskara
    </div>
  )
}

export default Dashboard
