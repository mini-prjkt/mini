import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Connections() {
  const [username, setUsername] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [message, setMessage] = useState('');
  const [userPosts, setUserPosts] = useState([]);
  const navigate = useNavigate();

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

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          required
        />
        <button type="submit">Search</button>
      </form>
      {message && <p>{message}</p>}
      {userInfo && (
        <div>
          <h2>User Details</h2>
          <p>Username: {userInfo.username}</p>
          <p>Email: {userInfo.email}</p>
          <p>Interests: {userInfo.interests.join(', ')}</p>
          <p>Country: {userInfo.country}</p>
          <h2>User Posts</h2>
          {userPosts.length > 0 ? (
            <ul>
              {userPosts.map(post => (
                <li key={post._id}>
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
    </div>
  );
}

export default Connections;
