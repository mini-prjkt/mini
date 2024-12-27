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

// Existing routes
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
  const { userId, typingAverage } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Append the new average
    user.behavioralData.typingSpeeds.push(typingAverage);

    // Ensure only 10 slices are stored
    if (user.behavioralData.typingSpeeds.length > 10) {
      user.behavioralData.typingSpeeds.shift(); // Remove the oldest entry
    }

    user.behavioralData.updatedAt = new Date();

    // Save the updated user data
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
    const typingSpeeds = user.behavioralData.typingSpeeds;
    const scrollSpeeds = user.behavioralData.scrollSpeeds;

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



export { router as UserRouter };
