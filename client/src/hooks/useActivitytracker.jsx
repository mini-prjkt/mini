import { useState, useEffect, useRef } from "react";
import axios from "axios";

const useActivityTracker = () => {
  const [typingSpeedData, setTypingSpeedData] = useState([]);
  const [scrollSpeedData, setScrollSpeedData] = useState([]);
  const [averageTypingSpeed, setAverageTypingSpeed] = useState(0);
  const [averageScrollSpeed, setAverageScrollSpeed] = useState(0);
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

  const captureScrollSpeed = () => {
    const currentTime = Date.now();
    const currentPosition =
      window.scrollY || document.documentElement.scrollTop || 0;

    if (lastScrollTime.current !== 0) {
      const scrollSpeed =
        Math.abs(currentPosition - lastScrollPosition.current) /
        (currentTime - lastScrollTime.current);
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
    if (userId && (typingSpeedData.length > 0 || scrollSpeedData.length > 0)) {
      const typingAverage = calculateAverage(typingSpeedData);
      const scrollAverage = calculateAverage(scrollSpeedData);

      try {
        const response = await axios.post(
          "http://localhost:5000/auth/update-behavior",
          { userId, typingAverage, scrollAverage },
          { withCredentials: true }
        );

        if (response.status === 200) {
          console.log("Behavioral data updated successfully");
          setTypingSpeedData([]);
          setScrollSpeedData([]);

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

              const predictResponse = await axios.post(
                "http://localhost:5003/predict-same-or-not",
                { user_id: userId }
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
        console.error(
          "Error updating behavioral data, averages, vector, or prediction:",
          error
        );
      }
    }
  };

  useEffect(() => {
    const debouncedCaptureScrollSpeed = debounce(captureScrollSpeed, 100);

    window.addEventListener("keydown", captureTypingSpeed);
    window.addEventListener("scroll", debouncedCaptureScrollSpeed);

    return () => {
      window.removeEventListener("keydown", captureTypingSpeed);
      window.removeEventListener("scroll", debouncedCaptureScrollSpeed);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isActive) {
        setAverageTypingSpeed(calculateAverage(typingSpeedData));
        setAverageScrollSpeed(calculateAverage(scrollSpeedData));
        sendBehavioralData();
        setIsActive(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isActive, typingSpeedData, scrollSpeedData]);

  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  return { averageTypingSpeed, averageScrollSpeed };
};

export default useActivityTracker;
