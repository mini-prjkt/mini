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
  const {
    userId,
    typingAverage,
    scrollAverage,
    messageLengthAverage,
    punctuationFrequencyAverage,
    uppercaseRatioAverage,
    lowercaseRatioAverage, // NEW: Lowercase ratio
  } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Append new data
    user.behavioralData.typingSpeeds.push(typingAverage);
    user.behavioralData.scrollSpeeds.push(scrollAverage);
    user.behavioralData.MessageLength.push(messageLengthAverage);
    user.behavioralData.PunctuationFrequency.push(punctuationFrequencyAverage);
    user.behavioralData.UppercaseRatio.push(uppercaseRatioAverage); // NEW: Add uppercase ratio
    user.behavioralData.LowercaseRatio.push(lowercaseRatioAverage); // NEW: Add lowercase ratio

    // Ensure only 10 entries are stored
    if (user.behavioralData.typingSpeeds.length > 10) user.behavioralData.typingSpeeds.shift();
    if (user.behavioralData.scrollSpeeds.length > 10) user.behavioralData.scrollSpeeds.shift();
    if (user.behavioralData.MessageLength.length > 10) user.behavioralData.MessageLength.shift();
    if (user.behavioralData.PunctuationFrequency.length > 10) user.behavioralData.PunctuationFrequency.shift();
    if (user.behavioralData.UppercaseRatio.length > 10) user.behavioralData.UppercaseRatio.shift(); // NEW
    if (user.behavioralData.LowercaseRatio.length > 10) user.behavioralData.LowercaseRatio.shift(); // NEW

    user.behavioralData.updatedAt = new Date();

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

    // Recalculate averages for all metrics
    const typingSpeeds = [...user.behavioralData.typingSpeeds];
    const scrollSpeeds = [...user.behavioralData.scrollSpeeds];
    const messageLengths = [...user.behavioralData.MessageLength];
    const punctuationFrequencies = [...user.behavioralData.PunctuationFrequency];
    const uppercaseRatios = [...user.behavioralData.UppercaseRatio]; // NEW
    const lowercaseRatios = [...user.behavioralData.LowercaseRatio]; // NEW

    // Exclude the most recent value for recalculation
    if (typingSpeeds.length > 1) typingSpeeds.pop();
    if (scrollSpeeds.length > 1) scrollSpeeds.pop();
    if (messageLengths.length > 1) messageLengths.pop();
    if (punctuationFrequencies.length > 1) punctuationFrequencies.pop();
    if (uppercaseRatios.length > 1) uppercaseRatios.pop(); // NEW
    if (lowercaseRatios.length > 1) lowercaseRatios.pop(); // NEW

    const calculateAverage = (data) => {
      if (!Array.isArray(data) || data.length === 0) return 0;
      return parseFloat((data.reduce((sum, value) => sum + value, 0) / data.length).toFixed(2));
    };

    const typingAverage = calculateAverage(typingSpeeds);
    const scrollAverage = calculateAverage(scrollSpeeds);
    const messageLengthAverage = calculateAverage(messageLengths);
    const punctuationAverage = calculateAverage(punctuationFrequencies);
    const uppercaseAverage = calculateAverage(uppercaseRatios); // NEW
    const lowercaseAverage = calculateAverage(lowercaseRatios); // NEW

    user.behavioralData.typingAverage = typingAverage;
    user.behavioralData.scrollAverage = scrollAverage;
    user.behavioralData.MessageLengthAverage = messageLengthAverage;
    user.behavioralData.PunctuationAverage = punctuationAverage;
    user.behavioralData.UppercaseAverage = uppercaseAverage; // NEW
    user.behavioralData.LowercaseAverage = lowercaseAverage; // NEW
    user.behavioralData.updatedAt = new Date();

    await user.save();

    res.status(200).json({
      message: 'Averages updated successfully',
      typingAverage,
      scrollAverage,
      messageLengthAverage,
      punctuationAverage,
      uppercaseAverage, // NEW
      lowercaseAverage, // NEW
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

    const {
      typingSpeeds,
      scrollSpeeds,
      MessageLength,
      PunctuationFrequency,
      UppercaseRatio,
      LowercaseRatio, // NEW
      typingAverage,
      scrollAverage,
      MessageLengthAverage,
      PunctuationAverage,
      UppercaseAverage,
      LowercaseAverage, // NEW
    } = user.behavioralData;

    const latestTypingSpeed = typingSpeeds[typingSpeeds.length - 1] || 0;
    const latestScrollSpeed = scrollSpeeds[scrollSpeeds.length - 1] || 0;
    const latestMessageLength = MessageLength[MessageLength.length - 1] || 0;
    const latestPunctuationFrequency = PunctuationFrequency[PunctuationFrequency.length - 1] || 0;
    const latestUppercaseRatio = UppercaseRatio[UppercaseRatio.length - 1] || 0; // NEW
    const latestLowercaseRatio = LowercaseRatio[LowercaseRatio.length - 1] || 0; // NEW

    user.vector = [
      typingAverage,
      scrollAverage,
      MessageLengthAverage,
      PunctuationAverage,
      UppercaseAverage,
      LowercaseAverage, // NEW
      latestTypingSpeed,
      latestScrollSpeed,
      latestMessageLength,
      latestPunctuationFrequency,
      latestUppercaseRatio, // NEW
      latestLowercaseRatio, // NEW
    ];

    await user.save();

    res.status(200).json({
      message: 'Vector updated successfully',
      vector: user.vector,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating vector', error });
  }
});

export { router as UserRouter };
