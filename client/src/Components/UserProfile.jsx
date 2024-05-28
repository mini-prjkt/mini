import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import '../css/profile.css';
import Header from '../header/Header';

function UserProfile() {
  const navigate = useNavigate();
  axios.defaults.withCredentials = true;

  const [verified, setVerified] = useState(false);
  const [userId, setUserId] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [predictedInterests, setPredictedInterests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const verifyRes = await axios.get('http://localhost:5000/auth/verify');
        if (verifyRes.data.status) {
          setVerified(true);
          setUserId(verifyRes.data.userId);

          const userInfoRes = await axios.post('http://localhost:5000/auth/userinfo', { userId: verifyRes.data.userId });
          if (userInfoRes.status === 200) {
            setUserInfo(userInfoRes.data);
            setUsername(userInfoRes.data.username);
            setEmail(userInfoRes.data.email);
            setSelectedCountry(userInfoRes.data.country || '');
          } else {
            throw new Error('Error fetching user info');
          }

          const countriesRes = await axios.get('https://restcountries.com/v3.1/all');
          if (countriesRes.status === 200) {
            setCountries(countriesRes.data.map(country => country.name.common));
          } else {
            throw new Error('Error fetching countries');
          }
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleCountryChange = async (event) => {
    const newCountry = event.target.value;
    setSelectedCountry(newCountry);
    try {
      await axios.post('http://localhost:5000/auth/update-country', { userId, country: newCountry });
    } catch (error) {
      console.error('Error updating country:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const updateRes = await axios.post('http://localhost:5000/auth/update-profile', { userId, username, email });
      if (updateRes.status === 200) {
        const updatedUserInfo = updateRes.data.user;
        setUserInfo(updatedUserInfo);
        alert("Profile updated successfully");
      } else {
        throw new Error('Error updating profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handlePredictInterest = async () => {
    try {
      const response = await axios.post('http://localhost:7860/predict', { text: newInterest });
      const predictedInterest = response.data.closest_language;
      setPredictedInterests([...predictedInterests, { name: predictedInterest, confirmed: false }]);
      setNewInterest('');
    } catch (error) {
      console.error('Error predicting interest:', error);
      alert('Error predicting interest');
    }
  };

  const handleConfirmInterest = async (index) => {
    const interest = predictedInterests[index];
    try {
      const response = await axios.post('http://localhost:5000/auth/confirm-interest', {
        userId,
        interestName: interest.name
      });
      if (response.data.status) {
        setUserInfo(prevState => ({
          ...prevState,
          interests: [...prevState.interests, response.data.interest]
        }));
        setPredictedInterests(predictedInterests.filter((_, i) => i !== index));
      } else {
        alert('Error confirming interest');
      }
    } catch (error) {
      console.error('Error confirming interest:', error);
      alert('Error confirming interest');
    }
  };

  const handleDeletePredictedInterest = (index) => {
    setPredictedInterests(predictedInterests.filter((_, i) => i !== index));
  };

  const handleRemoveInterest = async (interestId) => {
    try {
      const response = await axios.post('http://localhost:5000/auth/remove-interest', { userId, interestId });
      if (response.data.status) {
        setUserInfo(prevState => ({
          ...prevState,
          interests: prevState.interests.filter(interest => interest._id !== interestId)
        }));
      } else {
        alert('Error removing interest');
      }
    } catch (error) {
      console.error('Error removing interest:', error);
      alert('Error removing interest');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!verified) {
    return <p>Verification failed. Redirecting...</p>;
  }

  return (
    <div>
    <Header/> 
    <div className="UserProfile">
      <h1>User Profile</h1>
      {userInfo ? (
        <div>
          <div>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled // Disable editing for email
            />
          </div>
          <div>
            <label htmlFor="country">Select a country:</label>
            <select id="country" value={selectedCountry} onChange={handleCountryChange}>
              <option value="">Select a country</option>
              {countries.map((country, index) => (
                <option key={index} value={country}>{country}</option>
              ))}
            </select>
          </div>
          <button onClick={handleUpdateProfile}>Update Profile</button>
          <div>
            <h3>Interests</h3>
            <ul>
              {userInfo.interests.map((interest, index) => (
                <li key={index}>
                  {interest.name}
                  <button onClick={() => handleRemoveInterest(interest._id)}>Remove</button>
                </li>
              ))}
            </ul>
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="Add new interest"
            />
            <button onClick={handlePredictInterest}>Add Interest</button>
          </div>
          <div>
            <h3>Predicted Interests to be confirmed:</h3>
            <ul>
              {predictedInterests.map((interest, index
              ) => (
                <li key={index}>
                  {interest.name}
                  {!interest.confirmed && (
                    <>
                      <button onClick={() => handleConfirmInterest(index)}>Confirm</button>
                      <button onClick={() => handleDeletePredictedInterest(index)}>Delete</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p>Error fetching user info</p>
      )}
    </div>
    </div>
  );
}

export default UserProfile;
