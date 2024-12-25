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

router.post('/update-behavior', async (req, res) => {
  const { userId, typingSpeeds, scrollSpeeds } = req.body;

  try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      // Calculate the average of the incoming data
      const calculateAverage = (data) => {
          if (data.length === 0) return 0;
          const sum = data.reduce((a, b) => a + b, 0);
          return sum / data.length;
      };

      const typingAverage = calculateAverage(typingSpeeds);
      const scrollAverage = calculateAverage(scrollSpeeds);

      // Append the new averages to the behavioral data
      user.behavioralData.typingSpeeds.push(typingAverage);
      user.behavioralData.scrollSpeeds.push(scrollAverage);
      user.behavioralData.updatedAt = new Date();

      // Check if data exceeds 50 entries
      if (user.behavioralData.typingSpeeds.length > 50 || user.behavioralData.scrollSpeeds.length > 50) {
          // Retain only the latest 50 averages
          user.behavioralData.typingSpeeds = user.behavioralData.typingSpeeds.slice(-50);
          user.behavioralData.scrollSpeeds = user.behavioralData.scrollSpeeds.slice(-50);

          // Set the retraining flag to true
          user.retrainingRequired = true;
      } else {
          // If no deletion occurs, keep retrainingRequired as false
          user.retrainingRequired = false;
      }

      // Save the updated user data
      await user.save();

      res.status(200).json({ message: 'Behavioral data updated successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Error updating data', error });
  }
});

export { router as UserRouter };
