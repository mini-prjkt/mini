import express from "express";
import { signup, login, forgotPassword, resetPassword, verifyUser, confirmInterest } from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify", verifyUser, (req, res) => {
  return res.json({ status: true, userId: req.userId, message: "authorized" });
});
//basiucalluy here we are writing ou custom headers hehe
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ status: true });
});

// New route for confirming interests
router.post("/confirm-interest", confirmInterest);

export { router as UserRouter };
