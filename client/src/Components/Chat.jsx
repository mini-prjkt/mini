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
    axios.get('http://localhost:5000/auth/verify')
      .then(res => {
        if (!res.data.status) {
          navigate('/');
        }
        else{
          fetchInteractions();
        }
      })
      .catch(error => {
        console.error('Error verifying user:', error);
      });
  }, []);

  const fetchInteractions = async () => {
      axios.defaults.withCredentials = true;
      try{
      const response = await axios.get('http://localhost:5000/chat/interactions');
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
            <p>Username: {interaction.username} , Last Message: {interaction.lastMessage}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Chat;
