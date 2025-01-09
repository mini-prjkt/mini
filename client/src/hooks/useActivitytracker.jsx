import { useState, useEffect, useRef } from "react";
import axios from "axios";

const useActivityTracker = () => {
  const [typingSpeedData, setTypingSpeedData] = useState([]);
  const [scrollSpeedData, setScrollSpeedData] = useState([]);
  const [messageLengthData, setMessageLengthData] = useState([]);
  const [punctuationFrequencyData, setPunctuationFrequencyData] = useState([]);
  const [uppercaseRatioData, setUppercaseRatioData] = useState([]); // NEW: Track uppercase ratio
  const [lowercaseRatioData, setLowercaseRatioData] = useState([]); // NEW: Track lowercase ratio
  const [averageTypingSpeed, setAverageTypingSpeed] = useState(0);
  const [averageScrollSpeed, setAverageScrollSpeed] = useState(0);
  const [averageMessageLength, setAverageMessageLength] = useState(0);
  const [averagePunctuationFrequency, setAveragePunctuationFrequency] = useState(0);
  const [averageUppercaseRatio, setAverageUppercaseRatio] = useState(0); // NEW: Track uppercase ratio average
  const [averageLowercaseRatio, setAverageLowercaseRatio] = useState(0); // NEW: Track lowercase ratio average
  const [isActive, setIsActive] = useState(false);
  const [userId, setUserId] = useState(null);
  const [consecutiveDifferentUsers, setConsecutiveDifferentUsers] = useState(0);
  const lastTypingTime = useRef(0);
  const lastScrollTime = useRef(0);
  const lastScrollPosition = useRef(0);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await axios.get("http://localhost:5000/auth/verify", {
          withCredentials: true,
        });
        if (res.data.status) {
          setUserId(res.data.userId);
        } else {
          console.error("User not authorized");
        }
      } catch (err) {
        console.error("Error fetching userId:", err);
      }
    };
    fetchUserId();
  }, []);

  const logoutUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/auth/logout", {
        withCredentials: true,
      });
      if (res.data.status) {
        alert("You have been logged out due to suspicious activity.");
        window.location.reload();
      } else {
        console.error("Error during logout:", res.data.message);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

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

  const captureMessageCharacteristics = (e) => {
    const message = e.target.value;

    // Track message length
    const messageLength = message.length;
    setMessageLengthData((prevData) => [...prevData, messageLength]);

    // Track punctuation frequency
    const punctuationCount = (message.match(/[.,!?;:]/g) || []).length;
    setPunctuationFrequencyData((prevData) => [...prevData, punctuationCount]);

    // Track uppercase and lowercase ratios
    const totalCharacters = message.length;
    const uppercaseCount = (message.match(/[A-Z]/g) || []).length;
    const lowercaseCount = (message.match(/[a-z]/g) || []).length;

    const uppercaseRatio = totalCharacters > 0 ? uppercaseCount / totalCharacters : 0;
    const lowercaseRatio = totalCharacters > 0 ? lowercaseCount / totalCharacters : 0;

    setUppercaseRatioData((prevData) => [...prevData, uppercaseRatio]);
    setLowercaseRatioData((prevData) => [...prevData, lowercaseRatio]);
  };

  const captureScrollSpeed = (e) => {
    const currentTime = Date.now();
    const currentPosition = window.scrollY || e.target.scrollTop || 0;
    if (lastScrollTime.current !== 0) {
      const scrollSpeed = Math.abs(currentPosition - lastScrollPosition.current) / (currentTime - lastScrollTime.current);
      if (scrollSpeed > 0 && scrollSpeed < 10) {
        setScrollSpeedData((prevData) => [...prevData, scrollSpeed]);
      }
    }
    lastScrollPosition.current = currentPosition;
    lastScrollTime.current = currentTime;
  };

  const calculateAverage = (data) => {
    if (!Array.isArray(data) || data.length === 0) return 0;
    return parseFloat((data.reduce((sum, value) => sum + value, 0) / data.length).toFixed(2));
  };

  const sendBehavioralData = async () => {
    if (
      userId &&
      (typingSpeedData.length > 0 ||
        scrollSpeedData.length > 0 ||
        messageLengthData.length > 0 ||
        punctuationFrequencyData.length > 0 ||
        uppercaseRatioData.length > 0 ||
        lowercaseRatioData.length > 0)
    ) {
      const typingAverage = calculateAverage(typingSpeedData);
      const scrollAverage = calculateAverage(scrollSpeedData);
      const messageLengthAverage = calculateAverage(messageLengthData);
      const punctuationFrequencyAverage = calculateAverage(punctuationFrequencyData);
      const uppercaseRatioAverage = calculateAverage(uppercaseRatioData); // NEW: Calculate uppercase average
      const lowercaseRatioAverage = calculateAverage(lowercaseRatioData); // NEW: Calculate lowercase average

      try {
        const response = await axios.post(
          "http://localhost:5000/auth/update-behavior",
          {
            userId,
            typingAverage,
            scrollAverage,
            messageLengthAverage,
            punctuationFrequencyAverage,
            uppercaseRatioAverage,
            lowercaseRatioAverage, // NEW: Send lowercase average
          },
          { withCredentials: true }
        );

        if (response.status === 200) {
          console.log("Behavioral data updated successfully");
          setTypingSpeedData([]);
          setScrollSpeedData([]);
          setMessageLengthData([]);
          setPunctuationFrequencyData([]);
          setUppercaseRatioData([]);
          setLowercaseRatioData([]); // NEW: Reset lowercase ratio data

          const avgResponse = await axios.post(
            "http://localhost:5000/auth/update-average",
            { userId },
            { withCredentials: true }
          );

          if (avgResponse.status === 200) {
            console.log("Averages recalculated successfully:", avgResponse.data);

            const vectorResponse = await axios.post(
              "http://localhost:5000/auth/update-vector",
              { userId },
              { withCredentials: true }
            );

            if (vectorResponse.status === 200) {
              console.log("Vector updated successfully:", vectorResponse.data);
            }
          }
        }
      } catch (error) {
        console.error("Error updating behavioral data, averages, vector:", error);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", captureTypingSpeed);
    window.addEventListener("input", captureMessageCharacteristics); // NEW: Listen for input events
    window.addEventListener("scroll", captureScrollSpeed);

    return () => {
      window.removeEventListener("keydown", captureTypingSpeed);
      window.removeEventListener("input", captureMessageCharacteristics); // NEW: Remove listener
      window.removeEventListener("scroll", captureScrollSpeed);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isActive) {
        setAverageTypingSpeed(calculateAverage(typingSpeedData));
        setAverageScrollSpeed(calculateAverage(scrollSpeedData));
        setAverageMessageLength(calculateAverage(messageLengthData));
        setAveragePunctuationFrequency(calculateAverage(punctuationFrequencyData));
        setAverageUppercaseRatio(calculateAverage(uppercaseRatioData)); // NEW: Update uppercase average
        setAverageLowercaseRatio(calculateAverage(lowercaseRatioData)); // NEW: Update lowercase average
        sendBehavioralData();
        setIsActive(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isActive, typingSpeedData, scrollSpeedData, messageLengthData, punctuationFrequencyData, uppercaseRatioData, lowercaseRatioData]); // NEW: Add dependencies

  return {
    averageTypingSpeed,
    averageScrollSpeed,
    averageMessageLength,
    averagePunctuationFrequency,
    averageUppercaseRatio, // NEW: Return uppercase average
    averageLowercaseRatio, // NEW: Return lowercase average
  };
};

export default useActivityTracker;
