import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const verifyToken = async (req, res, next) => {
  // Extract token from cookies
  const token = req.cookies.token; // Assuming the JWT cookie is named 'jwt'
  if (!token) return res.status(401).json({ message: 'Token missing' });

  jwt.verify(token, process.env.KEY, async (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });

    req.username = decoded.username; 
    const user = await User.findOne({ username: req.username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    req.userId = user._id;
    next();
  });
};

export { verifyToken };