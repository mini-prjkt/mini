import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

function Chat(){
  const navigate = useNavigate();
  const [interactions, setInteractions] = useState([]);
  const [token, setToken] = useState('');

  useEffect(() => {
    axios.defaults.withCredentials = true;

    // Retrieve token from cookie
    const tokenFromCookie = cookies.get('token');
    if (tokenFromCookie) {
      setToken(tokenFromCookie);
      fetchInteractions(tokenFromCookie); // Fetch interactions with the token
    } else {
      // If token is not found in cookie, redirect to login
      navigate('/');
    }
  }, [navigate]);

  const fetchInteractions = async (token) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.get('http://localhost:5000/chat/interactions', config);
      setInteractions(response.data); // Set interactions state with data from API
    } catch (error) {
      console.error('Error fetching interactions:', error);
    }
  };

  return (
    <div>
      <h1>Chat</h1>
      <div>
        {/* Display interactions */}
        {interactions.map((interaction, index) => (
          <div key={index}>
            <p>Username: {interaction.username}</p>
            <p>Last Message: {interaction.lastMessage}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Chat;
