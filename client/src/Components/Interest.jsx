import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/interest.css';

function Interest() {
  const navigate = useNavigate();
  axios.defaults.withCredentials = true;

  const [inputText, setInputText] = useState('');
  const [interests, setInterests] = useState([]);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await axios.get('http://localhost:5000/auth/verify');
        console.log('Full response:', res); // Log the full response
        console.log('Response data:', res.data); // Log the response data
        
        if (!res.data.status) {
          navigate('/');
        } else {
          const fetchedUserId = res.data.userId;
          console.log('Fetched userId:', fetchedUserId); // Log the fetched userId
          setUserId(fetchedUserId);
        }
      } catch (err) {
        console.error('Error during verification:', err);
        navigate('/');
      }
    };

    verifyUser();
  }, [navigate]);

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const addInterest = async () => {
    try {
      const response = await axios.post('http://localhost:7860/predict', { text: inputText });
      const predictedInterest = response.data.closest_language;
      setInterests([...interests, { name: predictedInterest, confirmed: false }]);
      setInputText('');
    } catch (error) {
      console.error('Error predicting interest:', error);
      alert('Error predicting interest');
    }
  };

  const confirmInterest = async (index) => {
    const interest = interests[index];
    console.log('Interest being confirmed:', interest);

    try {
      const response = await axios.post('http://localhost:5000/auth/confirm-interest', {
        userId,
        interestName: interest.name
      });
      if (response.data.status) {
        setInterests(interests.map((int, i) => i === index ? { ...int, confirmed: true } : int));
      } else {
        alert('Error confirming interest');
      }
    } catch (error) {
      console.error('Error confirming interest:', error);
      alert('Error confirming interest');
    }
  };

  const deleteInterest = (index) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  return (
    <div className="Appp">
      <h1>Interest Detection</h1>
      <textarea
        rows="4"
        cols="50"
        value={inputText}
        onChange={handleInputChange}
        placeholder="Enter text..."
      ></textarea>
      <button onClick={addInterest}>Add Interest</button>
      <div>
        <h2>Interests to be confirmed:</h2>
        <ul>
          {interests.map((interest, index) => (
            <li key={index}>
              {interest.name}
              {!interest.confirmed && (
                <>
                  <button onClick={() => confirmInterest(index)}>Confirm</button>
                  <button onClick={() => deleteInterest(index)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
      <a href="/welcome"><button>take to me to dashboard</button></a>
    </div>
  );
}

export default Interest;
