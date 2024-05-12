// Interest.js
import React, { useEffect ,useState } from 'react'
import axios from "axios";
import { useNavigate } from 'react-router-dom'
import '../css/interest.css';

function Interest() {
  const navigate = useNavigate()
  axios.defaults.withCredentials = true;
  useEffect(() => {
      axios.get('http://localhost:5000/auth/verify')
      .then(res=> {
          if(res.data.status) {
            
          } else {
              navigate('/')
          }
          console.log(res)
      })
  }, [])

  const [inputText, setInputText] = useState('');
  const [closestLanguage, setClosestLanguage] = useState('');

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const getClosestLanguage = async () => {
    try {
      const response = await axios.post('http://localhost:7860/predict', { text: inputText });
      setClosestLanguage(response.data.closest_language);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
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
      <button onClick={getClosestLanguage}>Detect Interest</button>
      {closestLanguage && <p>Closest interest: {closestLanguage}</p>}
    </div>
  );
}

export default Interest;
