// userRoutes.js

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
  
  searchUser// Import the searchUser function
} from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify", verifyUser, (req, res) => {
  return res.json({ status: true, userId: req.userId, message: "authorized" });
});
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ status: true });
});
router.post("/userinfo", getUserInfo);
router.post("/confirm-interest", confirmInterest);
router.post("/update-country", updateCountry);
router.post("/update-profile", updateProfile);
router.post("/remove-interest", removeInterest);
router.post("/add-post", verifyUser, addPost);
router.post("/get-posts", verifyUser, getPostsByUser);
router.get("/relevant-posts", verifyUser, getRelevantPosts);

router.post("/searchUser", verifyUser,searchUser); // Add this line to handle user search
router.post("/searchUserss",verifyUser,searchUsers);
export { router as UserRouter };
