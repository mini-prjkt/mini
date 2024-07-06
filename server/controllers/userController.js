import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { User } from "../models/User.js";
import { Post } from "../models/Post.js";
import { Interest } from "../models/Interest.js";

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

    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.KEY, {
      expiresIn: "1h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600000
    });
    return res.json({ status: true, userId: user._id, message: "Login successfully" });
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
    const token = jwt.sign({ id: user._id }, process.env.KEY);

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
      return res.json({ status: false, message: 'No token' });
    }
    const decoded = await jwt.verify(token, process.env.KEY);
    req.userId = decoded.userId; // Attach userId to the request object
    res.locals.userId = decoded.userId; // Optionally attach userId to res.locals for easy access
    console.log(`verifyUser is attaching the userId: ${decoded.userId}`); // Log the decoded userId
    next();
  } catch (error) {
    return res.json({ status: false, message: 'Invalid token' });
  }
};
const confirmInterest = async (req, res) => {
  const { userId, interestName } = req.body;
  try {
    let interest = await Interest.findOne({ name: interestName });

    if (!interest) {
      interest = new Interest({ name: interestName, createdBy: userId });
      await interest.save();
    }

    await User.findByIdAndUpdate(userId, { $addToSet: { interests: interest._id } });

    return res.json({ status: true, message: 'Interest confirmed', interest });
  } catch (error) {
    console.error('Error confirming interest:', error);
    return res.status(500).json({ message: error.message });
  }
};
const getUserInfo = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId).populate('interests', 'name'); // Populate interests with names
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { username, email, interests, country } = user;

    // Extract interest names from populated interests
    const interestNames = interests.map(interest => interest.name);

    return res.json({ username, email, interests: interestNames, country });
  } catch (error) {
    console.error('Error fetching user info:', error);
    return res.status(500).json({ message: error.message });
  }
};



const updateCountry = async (req, res) => {
  const { userId, country } = req.body;
  try {
    const user = await User.findByIdAndUpdate(userId, { country }, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ status: true, message: "Country updated", country: user.country });
  } catch (error) {
    console.error('Error updating country:', error);
    return res.status(500).json({ message: error.message });
  }
}; const updateProfile = async (req, res) => {
  const { userId, username, email } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { username, email },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ status: true, message: "Profile updated", user });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: error.message });
  }
};

const removeInterest = async (req, res) => {
  const { userId, interestId } = req.body;
  try {
    await User.findByIdAndUpdate(userId, { $pull: { interests: interestId } });
    return res.json({ status: true, message: 'Interest removed' });
  } catch (error) {
    console.error('Error removing interest:', error);
    return res.status(500).json({ message: error.message });
  }
};

const addPost = async (req, res) => {
  const { title, content, url, tag } = req.body; // Include 'tag' in the destructuring
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newPost = new Post({
      title,
      content,
      url,
      tag,
      author: userId,
    });

    await newPost.save();
    await User.findByIdAndUpdate(userId, { $push: { posts: newPost._id } });

    return res.json({ status: true, message: "Post added successfully", post: newPost });
  } catch (error) {
    console.error('Error adding post:', error);
    return res.status(500).json({ message: error.message });
  }
};

const getPostsByUser = async (req, res) => {
  const { userId } = req.body;
  try {
    const posts = await Post.find({ author: userId });
    return res.json({ status: true, posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({ status: false, message: 'Error fetching posts' });
  }
};

const searchUsers = async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username }).populate('interests', 'name').populate('posts'); // Populate interests with names and posts
    if (!user) {
      return res.json({ status: false, message: "User not found" });
    }

    const interestNames = user.interests.map(interest => interest.name); // Extract interest names
    const userPosts = user.posts; // Extract user posts

    const userInfo = {
      username: user.username,
      email: user.email,
      interests: interestNames, // Use interest names instead of IDs
      country: user.country,
      posts: userPosts, // Include posts in the userInfo
    };
    return res.json({ status: true, user: userInfo });
  } catch (error) {
    console.error('Error searching user:', error);
    return res.status(500).json({ status: false, message: 'Error searching user' });
  }
};

const searchUser = async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username })
      .populate('interests', 'name')
      .populate('posts'); // Ensure posts are populated

    if (!user) {
      return res.json({ status: false, message: "User not found" });
    }

    const interestNames = user.interests.map(interest => interest.name); // Extract interest names

    // Fetch posts that match user interests
    const relevantPosts = await Post.find({ tag: { $in: interestNames } }).populate('author', 'username');

    const userInfo = {
      username: user.username,
      email: user.email,
      interests: interestNames,
      country: user.country,
      posts: relevantPosts, // Include relevant posts
    };

    return res.json({ status: true, user: userInfo });
  } catch (error) {
    console.error('Error searching user:', error);
    return res.status(500).json({ status: false, message: 'Error searching user' });
  }
};


const getRelevantPosts = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).populate('interests', 'name');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const interests = user.interests.map(interest => new RegExp(interest.name, 'i'));
    const posts = await Post.find({
      $and: [
        {
          $or: [
            { title: { $in: interests } },
            { url: { $in: interests } },
            { tag: { $in: interests } },
            { content: { $in: interests } }
          ]
        },
        { author: { $ne: userId } } // Exclude user's own posts
      ]
    }).populate('author', 'username email');

    return res.json({ status: true, posts });
  } catch (error) {
    console.error('Error fetching relevant posts:', error);
    return res.status(500).json({ message: error.message });
  }
};



export {
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
  searchUser // Add this line for user search functionality
};