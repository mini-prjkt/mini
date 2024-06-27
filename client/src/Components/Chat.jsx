import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import '../css/chat.css';

function Chat() {
  const navigate = useNavigate();
  const [interactions, setInteractions] = useState([]);
  const [selectedInteraction, setSelectedInteraction] = useState(null);
  const [olderMessages, setOlderMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatUsername, setNewChatUsername] = useState('');
  const [socket, setSocket] = useState(null);
  const popupRef = useRef(null);

  useEffect(() => {
    axios.defaults.withCredentials = true;
    axios.get('http://localhost:5000/auth/verify')
      .then(res => {
        if (!res.data.status) {
          navigate('/');
        } else {
          fetchInteractions();
        }
      })
      .catch(error => {
        console.error('Error verifying user:', error);
      });
  }, [navigate]);

  useEffect(() => {
    const newSocket = io('http://localhost:8080', {
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.on('message', (message) => {
      if (selectedInteraction && message.from.username === selectedInteraction.username) {
        setOlderMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return () => {
      newSocket.close();
    };
  }, [selectedInteraction]);

  const fetchInteractions = async () => {
    axios.defaults.withCredentials = true;
    try {
      const response = await axios.get('http://localhost:5000/chat/interactions');
      setInteractions(response.data); // Set interactions state with data from API
    } catch (error) {
      console.error('Error fetching interactions:', error);
    }
  };

  const handleInteractionClick = async (interaction) => {
    setSelectedInteraction(interaction);
    setIsPopupOpen(true);
    // Fetch older messages from API
    const messages = await fetchOlderMessages(interaction.username);
    setOlderMessages(messages);
  };

  const fetchOlderMessages = async (username) => {
    try {
      const response = await axios.post('http://localhost:5000/chat/read', {
        participant: username
      });
      return response.data.messages; // Extract the messages array from the response
    } catch (error) {
      console.error('Error fetching older messages:', error);
      return [];
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && socket) {
      const message = {
        to: selectedInteraction.username,
        body: newMessage,
      };
      socket.emit('message', message);
      setOlderMessages((prevMessages) => [...prevMessages, { from: { username: 'you' }, ...message }]);
      setNewMessage('');
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setOlderMessages([]);
    setSelectedInteraction(null); // Clear selected interaction when popup is closed
  };

  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      handleClosePopup();
    }
  };

  useEffect(() => {
    if (isPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopupOpen]);

  const handleNewChatClick = () => {
    setIsNewChatOpen(true);
  };

  const handleNewChatSubmit = async (e) => {
    e.preventDefault();
    if (newChatUsername.trim()) {
      const interaction = { username: newChatUsername };
      setSelectedInteraction(interaction);
      setIsPopupOpen(true);
      setIsNewChatOpen(false);
      const messages = await fetchOlderMessages(newChatUsername);
      setOlderMessages(messages);
    }
  };

  const handleNewChatCancel = () => {
    setIsNewChatOpen(false);
    setNewChatUsername('');
  };

  return (
    <div>
      <h1>Chat</h1>
      <div>
        {/* Display interactions */}
        {interactions.map((interaction, index) => (
          <div key={index} onClick={() => handleInteractionClick(interaction)}>
            <p>Username: {interaction.username}, Last Message: {interaction.lastMessage}</p>
          </div>
        ))}
      </div>
      <button onClick={handleNewChatClick}>+ New Chat</button>

      {isPopupOpen && (
        <div className="popup">
          <div className="popup-content" ref={popupRef}>
            <button onClick={handleClosePopup}>Close</button>
            <h2>Chat with {selectedInteraction.username}</h2>
            <div className="message-list">
              {olderMessages.map((message, index) => (
                <p key={index}>{message.from.username} -&gt; {message.body}</p>
              ))}
            </div>
            <div className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message"
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}

      {isNewChatOpen && (
        <div className="popup">
          <div className="popup-content">
            <h2>Start a New Chat</h2>
            <form onSubmit={handleNewChatSubmit}>
              <input
                type="text"
                value={newChatUsername}
                onChange={(e) => setNewChatUsername(e.target.value)}
                placeholder="Enter username"
              />
              <button type="submit">Start Chat</button>
              <button type="button" onClick={handleNewChatCancel}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;