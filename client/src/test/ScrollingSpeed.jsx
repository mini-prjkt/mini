import React, { useEffect, useState } from "react";

const ScrollingSpeed = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [lastTimestamp, setLastTimestamp] = useState(0);
  const [scrollSpeed, setScrollSpeed] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = performance.now();

      if (lastTimestamp) {
        const distance = Math.abs(currentScrollY - scrollPosition);
        const timeElapsed = (currentTime - lastTimestamp) / 1000; // Convert ms to seconds

        if (timeElapsed > 0) {
          const speed = distance / timeElapsed; // px per second
          setScrollSpeed(speed);
          console.log(`Scroll speed: ${speed.toFixed(2)} px/s`);
        }
      }

      setScrollPosition(currentScrollY);
      setLastTimestamp(currentTime);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrollPosition, lastTimestamp]);

  return (
    <div style={{ height: "200vh", padding: "20px" }}>
      <h1>Scroll Speed Tracker</h1>
      <p>Scroll down the page to see the scroll speed logged in the console.</p>
    </div>
  );
};

export default ScrollingSpeed;
