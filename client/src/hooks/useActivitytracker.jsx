import { useState, useEffect, useRef } from "react";
import axios from "axios";

const useActivityTracker = () => {
  const [typingSpeedData, setTypingSpeedData] = useState([]);
  const [averageTypingSpeed, setAverageTypingSpeed] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [userId, setUserId] = useState(null);
  const [consecutiveDifferentUsers, setConsecutiveDifferentUsers] = useState(0);
  const lastTypingTime = useRef(0);

  // Fetch the user ID on initial mount
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

  // Logout the user
  const logoutUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/auth/logout", {
        withCredentials: true,
      });
      if (res.data.status) {
        alert("You have been logged out due to suspicious activity.");
        window.location.reload(); // Redirect to login page or refresh
      } else {
        console.error("Error during logout:", res.data.message);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Capture typing speed on keydown
  const captureTypingSpeed = () => {
    setIsActive(true);
    const currentTime = Date.now();
    if (lastTypingTime.current !== 0) {
      const typingSpeed = currentTime - lastTypingTime.current;
      if (typingSpeed > 0 && typingSpeed < 2000) {
        setTypingSpeedData((prevData) => [...prevData, typingSpeed]);
        console.log(`Latest Typing Speed: ${typingSpeed} ms/keystroke`);
      }
    }
    lastTypingTime.current = currentTime;
  };

  // Calculate average of data array
  const calculateAverage = (data) => {
    if (!Array.isArray(data) || data.length === 0) return 0;
    return parseFloat(
      (data.reduce((sum, value) => sum + value, 0) / data.length).toFixed(2)
    );
  };

  // Send behavioral data and check prediction
  const sendBehavioralData = async () => {
    if (userId && typingSpeedData.length > 0) {
      const typingAverage = calculateAverage(typingSpeedData);

      try {
        const response = await axios.post(
          "http://localhost:5000/auth/update-behavior",
          { userId, typingAverage },
          { withCredentials: true }
        );

        if (response.status === 200) {
          console.log("Behavioral data updated successfully");
          setTypingSpeedData([]);

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
              const { vector } = vectorResponse.data;
              console.log("Vector updated successfully:", vectorResponse.data);

              // Log latest typing and scrolling speeds
              const latestTypingSpeed = vector[2];
              const latestScrollingSpeed = vector[3];
              console.log(`Latest Typing Speed: ${latestTypingSpeed} ms/keystroke`);
              console.log(`Latest Scrolling Speed: ${latestScrollingSpeed} px/ms`);

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

                // Log the prediction results
                console.log("Predict API Response:", predictResponse.data);
                console.log(`Prediction: ${prediction}, Model Probability: ${model_probability}`);
                console.log(
                  `Typing Deviation: ${typing_deviation_absolute}, Scrolling Deviation: ${scrolling_deviation_absolute}`
                );

                // Handle consecutive "Not Same User" predictions
                if (prediction === "Not Same User") {
                  setConsecutiveDifferentUsers((prevCount) => {
                    const newCount = prevCount + 1;
                    if (newCount >= 3) {
                      logoutUser(); // Log out after 3 consecutive "Not Same User"
                      return 0; // Reset counter after logout
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

  // Listen for typing activity
  useEffect(() => {
    window.addEventListener("keydown", captureTypingSpeed);

    return () => {
      window.removeEventListener("keydown", captureTypingSpeed);
    };
  }, []);

  // Send data periodically if activity is detected
  useEffect(() => {
    const interval = setInterval(() => {
      if (isActive) {
        const avgTyping = calculateAverage(typingSpeedData);
        setAverageTypingSpeed(avgTyping);
        sendBehavioralData();
        setIsActive(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isActive, typingSpeedData]);

  return { averageTypingSpeed };
};

export default useActivityTracker;
