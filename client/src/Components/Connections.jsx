import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../header/Header';
import "../css/connection.css";

function Connections() {
  const [username, setUsername] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [message, setMessage] = useState('');
  const [userPosts, setUserPosts] = useState([]);
  const [typingSpeedData, setTypingSpeedData] = useState([]); // Store typing speed values
  const [scrollSpeedData, setScrollSpeedData] = useState([]); // Store scroll speed values
  const [averageTypingSpeed, setAverageTypingSpeed] = useState(0);
  const [averageScrollSpeed, setAverageScrollSpeed] = useState(0);
  const [isActive, setIsActive] = useState(false); // Track activity status

  const navigate = useNavigate();

  // Refs to track typing and scrolling
  const lastTypingTime = useRef(0);
  const lastScrollTime = useRef(0);
  const lastScrollPosition = useRef(0);

  useEffect(() => {
    axios.defaults.withCredentials = true;
    axios.get('http://localhost:5000/auth/verify')
      .then(res => {
        if (!res.data.status) {
          navigate('/'); // Redirect to login page if user is not authenticated
        }
      })
      .catch(error => {
        console.error('Error verifying user:', error);
        navigate('/'); // Redirect to login page if there's an error
      });
  }, [navigate]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/auth/searchUserss', { username });
      if (res.data.status) {
        setUserInfo(res.data.user);
        setUserPosts(res.data.user.posts); // Assuming the backend sends user posts along with user details
        setMessage('');
      } else {
        setUserInfo(null);
        setUserPosts([]);
        setMessage('User not found');
      }
    } catch (error) {
      console.error('Error searching user:', error);
      setMessage('Error searching user');
    }
  };

  const captureTypingSpeed = () => {
    setIsActive(true); // Mark activity as true
    const currentTime = Date.now();
    if (lastTypingTime.current !== 0) {
      const typingSpeed = currentTime - lastTypingTime.current;
      if (typingSpeed > 0 && typingSpeed < 2000) { // Ignore unrealistic values
        setTypingSpeedData(prevData => [...prevData, typingSpeed]);
      }
    }
    lastTypingTime.current = currentTime;
  };

  const captureScrollSpeed = () => {
    setIsActive(true); // Mark activity as true
    const currentTime = Date.now();
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

    if (lastScrollTime.current !== 0) {
      const timeDiff = currentTime - lastScrollTime.current;
      const distance = Math.abs(scrollTop - lastScrollPosition.current);
      const scrollSpeed = timeDiff > 0 ? distance / timeDiff : 0; // Pixels per millisecond
      if (scrollSpeed > 0 && scrollSpeed < 10) { // Ignore unrealistic values
        setScrollSpeedData(prevData => [...prevData, scrollSpeed]);
      }
    }

    lastScrollTime.current = currentTime;
    lastScrollPosition.current = scrollTop;
  };

  const calculateAverage = (data) => {
    if (data.length === 0) return 0;
    const sum = data.reduce((a, b) => a + b, 0);
    return (sum / data.length).toFixed(2);
  };

  useEffect(() => {
    // Add event listeners for typing and scrolling
    window.addEventListener('keydown', captureTypingSpeed);
    window.addEventListener('scroll', captureScrollSpeed);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('keydown', captureTypingSpeed);
      window.removeEventListener('scroll', captureScrollSpeed);
    };
  }, []);

  useEffect(() => {
    // Update averages every 5 seconds only if active
    const interval = setInterval(() => {
      if (isActive) {
        const avgTyping = calculateAverage(typingSpeedData);
        const avgScroll = calculateAverage(scrollSpeedData);
        setAverageTypingSpeed(avgTyping);
        setAverageScrollSpeed(avgScroll);
        console.log(`Average Typing Speed (Last 5s): ${avgTyping} ms/keystroke`);
        console.log(`Average Scroll Speed (Last 5s): ${avgScroll} px/ms`);
        setIsActive(false); // Reset activity status after calculation
      }
    }, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [isActive, typingSpeedData, scrollSpeedData]);

  return (
    <div className='outer-divv'>
      <Header />
      <div className="connections-container">
        <form onSubmit={handleSearch} className="search-form">
          <input
            id="search-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            required
            className="search-input"
          />
          <button type="submit" className="search-button">Search</button>
        </form>
        {message && <p className="message">{message}</p>}
        {userInfo && (
          <div className="user-info">
            <h2>User Details</h2>
            <p>Username: {userInfo.username}</p>
            <p>Email: {userInfo.email}</p>
            <p>Interests: {userInfo.interests.join(', ')}</p>
            <p>Country: {userInfo.country}</p>
          </div>
        )}
        {userInfo && (
          <div className="user-posts">
            <h2>User Posts</h2>
            {userPosts.length > 0 ? (
              <ul>
                {userPosts.map(post => (
                  <li key={post._id} className="post-item">
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>
                    <p>URL: <a href={post.url} target="_blank" rel="noopener noreferrer">{post.url}</a></p>
                    <p>Tag: {post.tag}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No posts found</p>
            )}
          </div>
        )}
        <div className="metrics-container">
          <h2>Real-Time Metrics</h2>
          <p><strong>Average Typing Speed:</strong> {averageTypingSpeed} ms/keystroke</p>
          <p><strong>Average Scroll Speed:</strong> {averageScrollSpeed} px/ms</p>
        </div>
      </div>
    </div>
  );
}

export default Connections;
