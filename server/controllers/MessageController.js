import { User } from "../models/User.js";
import { Message } from "../models/Message.js";
import { Interactions } from "../models/Interactions.js";

const getInteractions = async (req, res) => {
  try {
    const interactions = await Interactions.findOne({ user: req.userId });

    if (!interactions) {
      return res.status(404).json({ message: 'No interactions found for the user' });
    }

    const participantPromises = interactions.participants.map(async (participantId) => {
      const participant = await User.findById(participantId).select('username');

      if (!participant) {
        return null;
      }

      const latestMessage = await Message.findOne({
        $or: [
          { from: req.userId, to: participantId },
          { from: participantId, to: req.userId }
        ]
      }).sort({ timestamp: -1 });

      return {
        username: participant.username,
        lastMessage: latestMessage ? latestMessage.body : null,
        lastMessageTime: latestMessage ? latestMessage.timestamp : null
      };
    });

    const results = await Promise.all(participantPromises);

    const filteredResults = results.filter(result => result !== null);

    filteredResults.sort((a, b) => {
      if (!a.lastMessageTime && !b.lastMessageTime) return 0;
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return b.lastMessageTime - a.lastMessageTime;
    });

    res.status(200).json(filteredResults);
  } catch (error) {
    console.error('Error fetching interactions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



const readMessage = async (req, res) => {
  try {
    const participantOne = await User.findOne({ username: req.username });
    const participantTwo = await User.findOne({ username: req.body.participant });

    if (!participantOne || !participantTwo) {
      return res.status(404).json({ message: "User not found" });
    }

    // Retrieve pagination parameters from the query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Retrieve messages between the two users with pagination, sorted by creation date in descending order
    const messages = await Message.find({
      $or: [
        { from: participantOne._id, to: participantTwo._id },
        { from: participantTwo._id, to: participantOne._id },
      ],
    })
      .populate({
        path: "from",
        select: "username -_id",
      })
      .populate({
        path: "to",
        select: "username -_id",
      })
      .select("body timestamp from to _id") // Select specific fields, include timestamp
      .sort({ timestamp: -1 }) // Sort by creation date in descending order (latest first)
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
    console.error('Error reading messages:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { readMessage , getInteractions };
