// WelcomePage.js

import React, { useEffect, useState } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import Header from '../header/Header';
import "../css/welcome.css"

function WelcomePage() {
  const [posts, setPosts] = useState([]);
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
      console.log(res.data); // Log the entire response object
      if (res.data.status) {
        setPosts(res.data.posts);
        console.log(res.data.posts); // Log the fetched posts for debugging
      } else {
        console.error("Failed to fetch relevant posts");
      }
    } catch (error) {
      console.error("Error fetching relevant posts:", error);
    }
  };
  
  return (
    <div className='outer-div'>
      <Header />
      <div className='posts'>
        {posts.map(post => (
          <div key={post._id} className='post'>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <a href={post.url}>{post.url}</a>
            <p>{post.tag}</p>
            <p>Posted by: {post.author.username} ({post.author.email})</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WelcomePage;
