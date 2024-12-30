import express from "express";
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  verifyUser,
  confirmInterest,
  getUserInfo,
  updateCountry,
  updateProfile,
  removeInterest,
  addPost,
  getPostsByUser,
  getRelevantPosts,
  searchUsers,
  searchUser,
} from "../controllers/userController.js";
import { User } from "../models/User.js"; // Ensure the correct path for your User model

const router = express.Router();

// Authentication Routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify", verifyUser, (req, res) => {
  return res.json({ status: true, userId: req.userId, message: "Authorized" });
});
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ status: true, message: "Logged out successfully" });
});

// User Information Routes
router.post("/userinfo", getUserInfo);
router.post("/confirm-interest", confirmInterest);
router.post("/update-country", updateCountry);
router.post("/update-profile", updateProfile);
router.post("/remove-interest", removeInterest);
router.post("/add-post", verifyUser, addPost);
router.post("/get-posts", verifyUser, getPostsByUser);
router.get("/relevant-posts", verifyUser, getRelevantPosts);
router.post("/searchUser", verifyUser, searchUser);
router.post("/searchUserss", verifyUser, searchUsers);

// Update behavioral data dynamically and recalculate averages
router.post('/update-behavior', async (req, res) => {
  const { userId, typingAverage, scrollAverage } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Append new averages
    user.behavioralData.typingSpeeds.push(typingAverage);
    user.behavioralData.scrollSpeeds.push(scrollAverage);

    // Ensure only 10 entries are stored
    if (user.behavioralData.typingSpeeds.length > 10) {
      user.behavioralData.typingSpeeds.shift();
    }
    if (user.behavioralData.scrollSpeeds.length > 10) {
      user.behavioralData.scrollSpeeds.shift();
    }

    user.behavioralData.updatedAt = new Date();

    // Save updated user data
    await user.save();

    res.status(200).json({ message: 'Behavioral data updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating data', error });
  }
});

router.post('/update-average', async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Recalculate averages for typing and scrolling speeds
    const typingSpeeds = [...user.behavioralData.typingSpeeds];
    const scrollSpeeds = [...user.behavioralData.scrollSpeeds];

    // Exclude the most recent value for recalculation
    if (typingSpeeds.length > 1) typingSpeeds.pop();
    if (scrollSpeeds.length > 1) scrollSpeeds.pop();

    const calculateAverage = (data) => {
      if (!Array.isArray(data) || data.length === 0) return 0;
      return parseFloat((data.reduce((sum, value) => sum + value, 0) / data.length).toFixed(2));
    };

    const typingAverage = calculateAverage(typingSpeeds);
    const scrollAverage = calculateAverage(scrollSpeeds);

    // Update the user's behavioral data
    user.behavioralData.typingAverage = typingAverage;
    user.behavioralData.scrollAverage = scrollAverage;
    user.behavioralData.updatedAt = new Date();

    await user.save();

    res.status(200).json({
      message: 'Averages updated successfully',
      typingAverage,
      scrollAverage
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating averages', error });
  }
});

router.post('/update-vector', async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Extract behavioral data
    const { typingSpeeds, scrollSpeeds, typingAverage, scrollAverage } = user.behavioralData;

    // Calculate the latest typing and scrolling speeds
    const latestTypingSpeed = typingSpeeds[typingSpeeds.length - 1] || 0; // Default to 0 if no data
    const latestScrollSpeed = scrollSpeeds[scrollSpeeds.length - 1] || 0; // Default to 0 if no data

    // Update the vector field
    user.vector = [typingAverage, scrollAverage, latestTypingSpeed, latestScrollSpeed];

    await user.save();

    res.status(200).json({
      message: 'Vector updated successfully',
      vector: user.vector
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating vector', error });
  }
});

export { router as UserRouter };
