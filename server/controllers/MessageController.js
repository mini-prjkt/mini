import { User } from "../models/User.js";
import { Message } from "../models/Message.js";

const createMessage = async (req, res) => {
  try {
    const fromUser = await User.findOne({ username: req.username });
    const toUser = await User.findOne({ username: req.body.to });
    const body = req.body.body;

    if (!fromUser || !toUser) {
      res.status(404).json("message:no such user");
    }

    const fromUserid = fromUser._id;
    const toUserid = toUser._id;

    await Message.create({
      from: fromUserid,
      to: toUserid,
      body: body,
    });

    res.status(201).json("message:message sent");
  } catch (error) {
    console.log(error);
    res.status(500).json({ Message: "interal server error" });
  }
};

const readMessage = async (req, res) => {
  try {
    const participantOne = await User.findOne({ username: req.username });

    const participantTwo = await User.findOne({
      username: req.body.participant,
    });

    if (!participantOne || !participantTwo) {
      return res.status(404).json({ message: "User not found" });
    }

    // Retrieve pagination parameters from the query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Retrieve messages between the two users with pagination, sorted by creation date
    const messages = await Message.find({
      $or: [
        { from: participantOne._id, to: participantTwo._id },
        { from: participantTwo._id, to: participantOne._id },
      ],
    })
      .populate({
        path: "from",
        select: "username -_id", // Select only the username, exclude _id
      })
      .populate({
        path: "to",
        select: "username -_id", // Select only the username, exclude _id
      })
      .select("body timestamp from to _id") // Select specific fields, exclude _id
      .sort({ createdAt: 1 }) // Sort by creation date in ascending order
      .skip(skip)
      .limit(limit);

    // Get the total count of messages between the two users
    const totalMessages = await Message.countDocuments({
      $or: [
        { from: participantOne._id, to: participantTwo._id },
        { from: participantTwo._id, to: participantOne._id },
      ],
    });

    // Respond with the messages and pagination info
    res.status(200).json({
      messages,
      totalMessages,
      currentPage: page,
      totalPages: Math.ceil(totalMessages / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const messageId = req.body.messageId;
    const userId = req.userId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.from.toString() !== userId.toString() && message.to.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Message does not belong to the user' });
      }

    await message.deleteOne();
    res
      .status(200)
      .json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { createMessage, readMessage, deleteMessage };