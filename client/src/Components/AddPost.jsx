// In the AddPost component:
import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import Header from '../header/Header';
import "../css/addpost.css"

function AddPost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    url: '',
    tag: '' // Add tag field to form data
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/auth/add-post', formData);
      navigate('/profile');
    } catch (error) {
      console.error('Error adding post:', error);
      navigate('/');
    }
  };

  useEffect(() => {
    axios.defaults.withCredentials = true;
    axios.get('http://localhost:5000/auth/verify')
      .then(res => {
        if (!res.data.status) {
          navigate('/');
        }
      })
      .catch(error => {
        console.error('Error verifying user:', error);
      });
  }, []);

  return (
    <div className='view-divv'>
<Header/>
    <div className='view-div'>
      
      <h2>Add Post</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required />
        </div>
        <div>
          <label htmlFor="content">Content:</label>
          <textarea id="content" name="content" value={formData.content} onChange={handleInputChange} required></textarea>
        </div>
        <div>
          <label htmlFor="url">URL:</label>
          <input type="text" id="url" name="url" value={formData.url} onChange={handleInputChange} required />
        </div>
        <div>
          <label htmlFor="tag">Tag:</label>
          <input type="text" id="tag" name="tag" value={formData.tag} onChange={handleInputChange} required />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
    </div>
  );
  
}

export default AddPost;
