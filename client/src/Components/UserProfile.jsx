import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/profile.css';

function UserProfile() {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nationality, setNationality] = useState('');
  const [interests, setInterests] = useState([]);
  const [newInterest, setNewInterest] = useState('');
  const [countries, setCountries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await axios.get('http://localhost:5000/auth/verify', { withCredentials: true });
        console.log('Full response:', res); // Log the full response
        console.log('Response data:', res.data); // Log the response data

        if (!res.data.status) {
          navigate('/');
        } else {
          const fetchedUserId = res.data.userId;
          console.log('Fetched userId:', fetchedUserId); // Log the fetched userId
          // Fetch the user data from the backend
          axios.get('/getuser', { withCredentials: true })
            .then(response => {
              if (response.data.status) {
                const user = response.data.user;
                setUsername(user.username);
                setEmail(user.email);
                setInterests(user.interests);
              } else {
                console.error('Failed to fetch user data:', response.data.message);
              }
            })
            .catch(error => {
              console.error('Error fetching user data:', error);
            });
        }
      } catch (err) {
        console.error('Error during verification:', err);
        navigate('/');
      }
    };

    verifyUser();

    // Fetch the list of countries from the API
    axios.get('https://restcountries.com/v3.1/all')
      .then(response => {
        const countryNames = response.data.map(country => country.name.common).sort();
        setCountries(countryNames);
      })
      .catch(error => {
        console.error('Error fetching countries:', error);
      });

  }, [navigate]);

  const handleAddInterest = () => {
    if (newInterest.trim() !== '') {
      setInterests([...interests, newInterest]);
      setNewInterest('');
    }
  };

  return (
    <div className="user-profile">
      <h1>Edit Profile</h1>
      <div>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Phone Number:
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Nationality:
          <select
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
          >
            <option value="">Select Nationality</option>
            {countries.map((country, index) => (
              <option key={index} value={country}>{country}</option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label>
          Interests:
          <input
            type="text"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
          />
          <button onClick={handleAddInterest}>Add Interest</button>
        </label>
      </div>
      <div>
        <h2>Current Interests</h2>
        <ul>
          {interests.map((interest, index) => (
            <li key={index}>{interest}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default UserProfile;
