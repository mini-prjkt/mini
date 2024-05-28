import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });
  
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token missing' });
  
    jwt.verify(token, process.env.KEY, async (err, decoded) => {
      if (err) return res.status(401).json({ message: 'Invalid token' });

      req.username = decoded.username; 
      const user = await User.findOne({username:req.username});
      req.userId = user._id;
      next();
    });
  };

export { verifyToken };