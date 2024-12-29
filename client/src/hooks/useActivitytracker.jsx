import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const useActivityTracker = () => {
  const [typingSpeedData, setTypingSpeedData] = useState([]);
  const [averageTypingSpeed, setAverageTypingSpeed] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [userId, setUserId] = useState(null);
  const [consecutiveDifferentUsers, setConsecutiveDifferentUsers] = useState(0); // Counter for different users
  const lastTypingTime = useRef(0);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await axios.get('http://localhost:5000/auth/verify', { withCredentials: true });
        if (res.data.status) {
          setUserId(res.data.userId);
        } else {
          console.error('User not authorized');
        }
      } catch (err) {
        console.error('Error fetching userId:', err);
      }
    };

    fetchUserId();
  }, []);

  const captureTypingSpeed = () => {
    setIsActive(true); // Mark activity as active
    const currentTime = Date.now();
    if (lastTypingTime.current !== 0) {
      const typingSpeed = currentTime - lastTypingTime.current;
      if (typingSpeed > 0 && typingSpeed < 2000) { // Ignore unrealistic values
        setTypingSpeedData((prevData) => [...prevData, typingSpeed]);
      }
    }
    lastTypingTime.current = currentTime;
  };

  const calculateAverage = (data) => {
    if (!Array.isArray(data) || data.length === 0) return 0;
    return parseFloat((data.reduce((sum, value) => sum + value, 0) / data.length).toFixed(2));
  };

  const sendBehavioralData = async () => {
    if (userId && typingSpeedData.length > 0) {
      const typingAverage = calculateAverage(typingSpeedData);

      try {
        // Update behavioral data
        const response = await axios.post(
          'http://localhost:5000/auth/update-behavior',
          { userId, typingAverage },
          { withCredentials: true }
        );

        if (response.status === 200) {
          console.log('Behavioral data updated successfully');
          setTypingSpeedData([]); // Clear the data after sending

          // Update averages
          const avgResponse = await axios.post(
            'http://localhost:5000/auth/update-average',
            { userId },
            { withCredentials: true }
          );

          if (avgResponse.status === 200) {
            console.log('Averages recalculated successfully:', avgResponse.data);

            // Update vector
            const vectorResponse = await axios.post(
              'http://localhost:5000/auth/update-vector',
              { userId },
              { withCredentials: true }
            );

            if (vectorResponse.status === 200) {
              console.log('Vector updated successfully:', vectorResponse.data);

              // Make prediction based on updated vector
              const predictResponse = await axios.post(
                'http://localhost:5003/predict-same-or-not',
                { user_id: userId }
              );

              if (predictResponse.status === 200) {
                console.log('Prediction result:', predictResponse.data);
                const { prediction } = predictResponse.data;

                // Check for consecutive "Not Same User" predictions
                if (prediction === 'Not Same User') {
                  setConsecutiveDifferentUsers((prevCount) => {
                    const newCount = prevCount + 1;
                    if (newCount >= 3) {
                      alert('ALERT: The user appears to be different for 3 consecutive checks!');
                      return 0; // Reset the counter after raising the alert
                    }
                    return newCount;
                  });
                } else {
                  setConsecutiveDifferentUsers(0); // Reset counter if the user is the same
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error updating behavioral data, averages, vector, or prediction:', error);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', captureTypingSpeed);

    return () => {
      window.removeEventListener('keydown', captureTypingSpeed);
    };
  }, []);

  useEffect(() => {
    // Update averages every 5 seconds only if active
    const interval = setInterval(() => {
      if (isActive) {
        const avgTyping = calculateAverage(typingSpeedData);
        setAverageTypingSpeed(avgTyping);
        sendBehavioralData();
        setIsActive(false); // Reset activity status
      }
    }, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [isActive, typingSpeedData]);

  return { averageTypingSpeed };
};

export default useActivityTracker;
