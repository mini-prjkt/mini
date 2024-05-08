import bcrypt from 'bcrypt';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

export const createUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.json({ status: true, message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to register user" });
  }
};


export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.json({ message: "User not registered" })
    }
    const token = jwt.sign({ id: user._id }, process.env.KEY)

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rishithp2003@gmail.com',
        pass: 'qbqd vxvg ayag ykyq'
      }
    });

    var mailOptions = {
      from: 'rishithp2003@gmail.com',
      to: email,
      subject: 'Reset password',
      text: `http://localhost:3000/resetpassword/${token}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return res.json({ message: "error sending a message" })
      } else {
        return res.json({ status: true, message: "email sent" })
      }
    });

  } catch (err) {
    console.log(err)
  }
};



export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email })
  if (!user) {
    return res.json({ message: "user not registered" })
  }
  const validPassword = await bcrypt.compare(password, user.password)
  if (!validPassword) {
    return res.json({ message: "password is incorrect" })
  }
  const token= jwt.sign({username:user.username},process.env.KEY)
  res.cookie('token',token,{httpOnly:true,maxAge:36000})
  return res.json({status:true,message:"login successfully"})
};

export const resetpassword = async (req, res) => {
  const token = req.params.token; // Extract token from params
  const { password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.KEY);
    const id = decoded.id;
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(id, { password: hashedPassword });
    return res.json({ status: true, message: "Updated password successfully" });
  } catch (err) {
    console.log(err);
    return res.json({ message: "Invalid token" });
  }
};


export const verifypassword = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.json({ status: false, message: "no token" })
    }
    const decoded = jwt.verify(token, process.env.KEY);
    next()
  } catch (err) {
    return res.json(err);
  }

};

export const getpassword = async (req, res) => {
  return res.json({ status: true, messgae: "authorized" })
};

export const logout = async (req, res) => {
  res.clearCookie('token')
  return res.json({ status: true })
};
