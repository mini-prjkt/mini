import { useState, useEffect, useRef } from "react";
import axios from "axios";

const useActivityTracker = () => {
  const [typingSpeedData, setTypingSpeedData] = useState([]);
  const [scrollSpeedData, setScrollSpeedData] = useState([]);
  const [messageLengthData, setMessageLengthData] = useState([]);
  const [punctuationFrequencyData, setPunctuationFrequencyData] = useState([]);
  const [uppercaseRatioData, setUppercaseRatioData] = useState([]);
  const [lowercaseRatioData, setLowercaseRatioData] = useState([]);
  const [averageTypingSpeed, setAverageTypingSpeed] = useState(0);
  const [averageScrollSpeed, setAverageScrollSpeed] = useState(0);
  const [averageMessageLength, setAverageMessageLength] = useState(0);
  const [averagePunctuationFrequency, setAveragePunctuationFrequency] = useState(0);
  const [averageUppercaseRatio, setAverageUppercaseRatio] = useState(0);
  const [averageLowercaseRatio, setAverageLowercaseRatio] = useState(0);
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
      const uppercaseRatioAverage = calculateAverage(uppercaseRatioData);
      const lowercaseRatioAverage = calculateAverage(lowercaseRatioData);

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
            lowercaseRatioAverage,
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
          setLowercaseRatioData([]);

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

              // Call the predict API
              const predictResponse = await axios.post(
                "http://localhost:5003/predict-same-or-not",
                { user_id: userId },
                { withCredentials: true }
              );

              if (predictResponse.status === 200) {
                const {
                  prediction,
                  model_probability,
                  typing_deviation_absolute,
                  scrolling_deviation_absolute,
                } = predictResponse.data;

                console.log("Predict API Response:", predictResponse.data);
                console.log(`Prediction: ${prediction}, Model Probability: ${model_probability}`);
                console.log(
                  `Typing Deviation: ${typing_deviation_absolute}, Scrolling Deviation: ${scrolling_deviation_absolute}`
                );

                if (prediction === "Not Same User") {
                  setConsecutiveDifferentUsers((prevCount) => {
                    const newCount = prevCount + 1;
                    if (newCount >= 3) {
                      logoutUser();
                      return 0;
                    }
                    return newCount;
                  });
                } else {
                  setConsecutiveDifferentUsers(0);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error updating behavioral data, averages, vector, or prediction:", error);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", captureTypingSpeed);
    window.addEventListener("input", captureMessageCharacteristics);
    window.addEventListener("scroll", captureScrollSpeed);

    return () => {
      window.removeEventListener("keydown", captureTypingSpeed);
      window.removeEventListener("input", captureMessageCharacteristics);
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
        setAverageUppercaseRatio(calculateAverage(uppercaseRatioData));
        setAverageLowercaseRatio(calculateAverage(lowercaseRatioData));
        sendBehavioralData();
        setIsActive(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isActive, typingSpeedData, scrollSpeedData, messageLengthData, punctuationFrequencyData, uppercaseRatioData, lowercaseRatioData]);

  return {
    averageTypingSpeed,
    averageScrollSpeed,
    averageMessageLength,
    averagePunctuationFrequency,
    averageUppercaseRatio,
    averageLowercaseRatio,
  };
};

export default useActivityTracker;
