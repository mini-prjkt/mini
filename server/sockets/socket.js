import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { Interactions } from '../models/Interactions.js';

const JWT_SECRET = 'jwttokenkey';

const socketUserMap = new Map();
const activeUsers = new Set();

const socket = (socketServer) => {
  const io = new Server(socketServer, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost.localdomain:3000"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.use((socket, next) => {
    const cookieHeader = socket.handshake.headers['cookie'];
    const token = cookieHeader ? cookieHeader.split('=')[1] : null;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error'));
      }
      socket.userId = decoded.userId;
      socketUserMap.set(socket.userId, socket.id);
      activeUsers.add(socket.userId);
      next();
    });
  });

  io.on('connection', async (socket) => {
    const socketUser = await User.findById(socket.userId);

    socket.on('disconnect', () => {
      const userId = socket.userId;
      socketUserMap.delete(userId);
      activeUsers.delete(userId);
    });

    socket.on('message', async (data) => {
      try {
        const { to, body } = data;

        const recipientUser = await User.findOne({ username: to });
        if (!recipientUser) {
          return;
        }

        const newMessage = await Message.create({
          from: socket.userId,
          to: recipientUser._id,
          body: body
        });

        // Update interactions for sender
        let senderInteraction = await Interactions.findOne({ user: socket.userId });
        if (!senderInteraction) {
          senderInteraction = new Interactions({
            user: socket.userId,
            participants: [recipientUser._id]
          });
        } else {
          if (!senderInteraction.participants.includes(recipientUser._id)) {
            senderInteraction.participants.push(recipientUser._id);
          }
        }
        await senderInteraction.save();

        // Update interactions for recipient
        let recipientInteraction = await Interactions.findOne({ user: recipientUser._id });
        if (!recipientInteraction) {
          recipientInteraction = new Interactions({
            user: recipientUser._id,
            participants: [socket.userId]
          });
        } else {
          if (!recipientInteraction.participants.includes(socket.userId)) {
            recipientInteraction.participants.push(socket.userId);
          }
        }
        await recipientInteraction.save();

        const recipientSocketId = socketUserMap.get(recipientUser._id.toString());
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('message', { id: newMessage._id, from: socketUser.username, body, to: recipientUser.username });
        }

      } catch (error) {
        console.log(error)
      }
    });
  });
};

export { socket };
