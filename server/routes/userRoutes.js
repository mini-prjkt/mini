// userRoutes.js

import express from "express";
import { signup, login, forgotPassword, resetPassword, verifyUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify", verifyUser, (req, res) => {
  return res.json({ status: true, message: "authorized" });
});
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ status: true });
});

export { router as UserRouter };
