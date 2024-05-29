import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/viewposts.css'
const MyPost = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.defaults.withCredentials = true;
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/auth/verify');
        console.log('Full response:', res);
        console.log('Response data:', res.data);

        if (!res.data.status) {
          navigate('/');
        } else {
          const fetchedUserId = res.data.userId;
          console.log('Fetched userId:', fetchedUserId);
          setUserId(fetchedUserId);

          // Fetch posts for the user
          const postsRes = await axios.post('http://localhost:5000/auth/get-posts', { userId: fetchedUserId });
          console.log('Posts response:', postsRes);
          console.log('Posts data:', postsRes.data);
          setPosts(postsRes.data.posts);
        }
      } catch (err) {
        console.error('Error during verification:', err);
        navigate('/');
      }
    };

    fetchData();
  }, [navigate]);

  return (

    <div >
      <h1>My Posts</h1>
      <div className="posts-container">
        {posts.map(post => (
          <div className="post" key={post._id}>
            <div className="post-details">
              <h2>{post.title}</h2>
              <p>{post.content}</p>
              <p>Tag: {post.tag}</p>
            </div>
            <a href={post.url} target="_blank" rel="noopener noreferrer">Take me there baby</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyPost;
