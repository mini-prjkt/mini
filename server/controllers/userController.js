import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { User } from "../models/User.js";


const signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.json({ message: "User already exists" });
    }

    const hashpassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashpassword,
    });

    await newUser.save();
    return res.json({ status: true, message: "Record registered" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User is not registered" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.json({ message: "Password is incorrect" });
    }

    const token = jwt.sign({ username: user.username }, process.env.KEY, {
      expiresIn: "1h",
    });
    res.cookie("token", token, { httpOnly: true, maxAge: 360000 });
    return res.json({ status: true, message: "Login successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log("Email received from frontend:", email);
  try {
    console.log("Received forgot password request for email:", email); // Log the email received
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email); // Log if user not found
      return res.json({ message: "User not registered" });
    }
    const token = jwt.sign({ id: user._id }, process.env.KEY, {
      expiresIn: "5m",
    });

    var transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: "miniprjkt@outlook.com",
        pass: "sumalathaAradhya",
      },
    });
    const encodedToken = encodeURIComponent(token).replace(/\./g, "%2E");
    var mailOptions = {
      from: "miniprjkt@outlook.com",
      to: email,
      subject: "Reset Password",
      text: `http://localhost:3000/resetPassword/${encodedToken}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error("Error sending email:", error); // Log the error
        return res.status(500).json({ message: "Error sending email to " + email }); // Return an error response
      } else {
        console.log("Email sent successfully to:", email); // Log if email sent successfully
        return res.json({ status: true, message: "Email sent" });
      }
    });
    
  } catch (error) {
    console.error("Error:", error); // Log any other errors
    return res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const decoded = await jwt.verify(token, process.env.KEY);
    const id = decoded.id;
    const hashPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate({ _id: id }, { password: hashPassword });
    return res.json({ status: true, message: "Updated password" });
  } catch (error) {
    return res.json("Invalid token");
  }
};

const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.json({ status: false, message: "No token" });
    }
    const decoded = await jwt.verify(token, process.env.KEY);
    next();
  } catch (error) {
    return res.json(error);
  }
};

const logUserId = async(req,res)=>{
  try {
    const user = await User.findOne({username:req.username});
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(`User ID: ${user._id}`);
    res.json({ message: `Logged user ID: ${user._id}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { signup, login, forgotPassword, resetPassword, verifyUser , logUserId};
