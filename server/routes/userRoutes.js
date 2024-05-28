// userRoutes.js

import express from "express";
import { signup, login, forgotPassword, resetPassword, verifyUser , logUserId} from "../controllers/userController.js"; // Import addInterest
import { verifyToken } from "../middleware/userMiddleware.js";
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

router.get("/user",verifyToken,(req,res)=>{
  logUserId(req,res);
});



export { router as UserRouter };
