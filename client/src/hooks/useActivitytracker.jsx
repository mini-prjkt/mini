import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const useActivityTracker = () => {
  const [typingSpeedData, setTypingSpeedData] = useState([]);
  const [scrollSpeedData, setScrollSpeedData] = useState([]);
  const [averageTypingSpeed, setAverageTypingSpeed] = useState(0);
  const [averageScrollSpeed, setAverageScrollSpeed] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [userId, setUserId] = useState(null);

  const lastTypingTime = useRef(0);
  const lastScrollTime = useRef(0);
  const lastScrollPosition = useRef(0);

  // Fetch user ID on mount
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await axios.get('http://localhost:5000/auth/verify', { withCredentials: true });
        if (res.data.status) {
          setUserId(res.data.userId); // Set the fetched userId
          console.log('Fetched userId:', res.data.userId);
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
    setIsActive(true);
    const currentTime = Date.now();
    if (lastTypingTime.current !== 0) {
      const typingSpeed = currentTime - lastTypingTime.current;
      if (typingSpeed > 0 && typingSpeed < 2000) {
        setTypingSpeedData((prevData) => [...prevData, typingSpeed]);
      }
    }
    lastTypingTime.current = currentTime;
  };

  const captureScrollSpeed = () => {
    setIsActive(true);
    const currentTime = Date.now();
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

    if (lastScrollTime.current !== 0) {
      const timeDiff = currentTime - lastScrollTime.current;
      const distance = Math.abs(scrollTop - lastScrollPosition.current);
      const scrollSpeed = timeDiff > 0 ? distance / timeDiff : 0;
      if (scrollSpeed > 0 && scrollSpeed < 10) {
        setScrollSpeedData((prevData) => [...prevData, scrollSpeed]);
      }
    }

    lastScrollTime.current = currentTime;
    lastScrollPosition.current = scrollTop;
  };

  const calculateAverage = (data) => {
    if (data.length === 0) return 0;
    const sum = data.reduce((a, b) => a + b, 0);
    return (sum / data.length).toFixed(2);
  };

  const sendBehavioralData = async () => {
    if (userId && (typingSpeedData.length > 0 || scrollSpeedData.length > 0)) {
      try {
        const response = await axios.post(
          'http://localhost:5000/auth/update-behavior',
          {
            userId,
            typingSpeeds: typingSpeedData,
            scrollSpeeds: scrollSpeedData,
          },
          { withCredentials: true }
        );

        if (response.status === 200) {
          console.log('Behavioral data updated successfully');
          // Clear local arrays after sending
          setTypingSpeedData([]);
          setScrollSpeedData([]);
        } else {
          console.error('Failed to update behavioral data');
        }
      } catch (error) {
        console.error('Error updating behavioral data:', error);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', captureTypingSpeed);
    window.addEventListener('scroll', captureScrollSpeed);

    return () => {
      window.removeEventListener('keydown', captureTypingSpeed);
      window.removeEventListener('scroll', captureScrollSpeed);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isActive) {
        const avgTyping = calculateAverage(typingSpeedData);
        const avgScroll = calculateAverage(scrollSpeedData);
        setAverageTypingSpeed(avgTyping);
        setAverageScrollSpeed(avgScroll);
        console.log(`Average Typing Speed: ${avgTyping} ms/keystroke`);
        console.log(`Average Scroll Speed: ${avgScroll} px/ms`);

        // Send data to the backend
        sendBehavioralData();

        setIsActive(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isActive, typingSpeedData, scrollSpeedData]);

  return { averageTypingSpeed, averageScrollSpeed };
};

export default useActivityTracker;
