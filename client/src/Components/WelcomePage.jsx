import React, { useEffect, useState } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import Header from '../header/Header';
import "../css/welcome.css"

function WelcomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  axios.defaults.withCredentials = true;

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await axios.get('http://localhost:5000/auth/verify');
        if (!res.data.status) {
          navigate('/');
        } else {
          fetchRelevantPosts();
        }
      } catch (error) {
        console.error("Error verifying user:", error);
        navigate('/');
      }
    };

    verifyUser();
  }, [navigate]);

  const fetchRelevantPosts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/auth/relevant-posts');
      if (res.data.status) {
        setPosts(res.data.posts);
      } else {
        setError("Failed to fetch relevant posts");
      }
    } catch (error) {
      console.error("Error fetching relevant posts:", error);
      setError("Error fetching relevant posts");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className='outer-div'>
      <Header />
      <div className='posts'>
        {loading ? (
          <p>Loading posts...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          posts.map(post => (
            <div key={post._id} className='post'>
              <h2>{post.title}</h2>
              <p>{post.content}</p>
              <a href={post.url}>{post.url}</a>
              <p>{post.tag}</p>
              {post.author ? (
                <p>Posted by: {post.author.username} ({post.author.email})</p>
              ) : (
                <p>Author information not available</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default WelcomePage;
