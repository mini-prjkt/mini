import React, { useState, useEffect, useRef } from "react";

const Test = () => {
  const [message, setMessage] = useState("");
  const [typingSpeedData, setTypingSpeedData] = useState([]);
  const [scrollSpeedData, setScrollSpeedData] = useState([]);
  const [averageTypingSpeed, setAverageTypingSpeed] = useState(0);
  const [averageScrollSpeed, setAverageScrollSpeed] = useState(0);
  const [punctuationFrequency, setPunctuationFrequency] = useState(0);
  const [emojiFrequency, setEmojiFrequency] = useState(0);
  const [uppercaseRatio, setUppercaseRatio] = useState(0);
  const [lowercaseRatio, setLowercaseRatio] = useState(0);
  const lastTypingTime = useRef(0);
  const lastScrollTime = useRef(0);
  const lastScrollPosition = useRef(0);

  const calculateAverage = (data) => {
    if (!Array.isArray(data) || data.length === 0) return 0;
    return parseFloat((data.reduce((sum, value) => sum + value, 0) / data.length).toFixed(2));
  };

  const captureTypingSpeed = () => {
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
    const currentPosition = window.scrollY || 0;
    if (lastScrollTime.current !== 0) {
      const scrollSpeed = Math.abs(currentPosition - lastScrollPosition.current) / (currentTime - lastScrollTime.current);
      if (scrollSpeed > 0 && scrollSpeed < 10) {
        setScrollSpeedData((prevData) => [...prevData, scrollSpeed]);
      }
    }
    lastScrollPosition.current = currentPosition;
    lastScrollTime.current = currentTime;
  };

  const analyzeMessage = () => {
    // Regular expressions for punctuation and emojis
    const punctuationRegex = /[!?.,:;]/g;
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}]/gu;

    // Counting punctuation and emojis
    const punctuationMatches = message.match(punctuationRegex) || [];
    const emojiMatches = message.match(emojiRegex) || [];
    const punctuationCount = punctuationMatches.length;
    const emojiCount = emojiMatches.length;

    // Total characters
    const totalCharacters = message.length;

    // Uppercase and lowercase counts
    const uppercaseCount = (message.match(/[A-Z]/g) || []).length;
    const lowercaseCount = (message.match(/[a-z]/g) || []).length;

    // Calculating frequencies and ratios
    setPunctuationFrequency(totalCharacters > 0 ? punctuationCount / totalCharacters : 0);
    setEmojiFrequency(totalCharacters > 0 ? emojiCount / totalCharacters : 0);
    setUppercaseRatio(totalCharacters > 0 ? uppercaseCount / totalCharacters : 0);
    setLowercaseRatio(totalCharacters > 0 ? lowercaseCount / totalCharacters : 0);

    // Logging results
    console.log("Analysis Results:");
    console.log(`Punctuation Count: ${punctuationCount}`);
    console.log(`Emoji Count: ${emojiCount}`);
    console.log(`Punctuation Frequency: ${punctuationFrequency}`);
    console.log(`Emoji Frequency: ${emojiFrequency}`);
    console.log(`Uppercase Ratio: ${uppercaseRatio}`);
    console.log(`Lowercase Ratio: ${lowercaseRatio}`);
    console.log(`Average Typing Speed: ${averageTypingSpeed}`);
    console.log(`Average Scroll Speed: ${averageScrollSpeed}`);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setAverageTypingSpeed(calculateAverage(typingSpeedData));
      setAverageScrollSpeed(calculateAverage(scrollSpeedData));
      setTypingSpeedData([]); // Clear typing speed data after updates
      setScrollSpeedData([]); // Clear scroll speed data after updates
      analyzeMessage(); // Analyze the message automatically
    }, 5000);

    return () => clearInterval(interval);
  }, [message, typingSpeedData, scrollSpeedData]);

  useEffect(() => {
    window.addEventListener("keydown", captureTypingSpeed);
    window.addEventListener("scroll", captureScrollSpeed);

    return () => {
      window.removeEventListener("keydown", captureTypingSpeed);
      window.removeEventListener("scroll", captureScrollSpeed);
    };
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Text Analysis Tool</h1>
      <textarea
        rows="6"
        cols="50"
        placeholder="Enter your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ marginBottom: "10px" }}
      ></textarea>
    </div>
  );
};

export default Test;
