// Enhanced server-side logging
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { Interactions } from '../models/Interactions.js';
import cookieParser from 'cookie-parser';
const JWT_SECRET = 'jwttokenkey';

const socketUserMap = new Map();
const activeUsers = new Set();

const socket = (socketServer) => {
  const io = new Server(socketServer,{
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.use((socket, next) => {
    const cookieHeader = socket.handshake.headers['cookie'];
    const token = cookieHeader.split('=')[1];
    if (!token) {
      console.log('No token provided');
      return next(new Error('Authentication error'));
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log('Invalid token:', err.message);
        return next(new Error('Authentication error'));
      }
      socket.userId = decoded.userId;
      socketUserMap.set(socket.userId, socket.id);
      activeUsers.add(socket.userId);
      console.log('User authenticated:', socket.userId);
      next();
    });
  });

  io.on('connection', async (socket) => {
    console.log('A user connected with session ID:', socket.id);
    console.log('User ID from token:', socket.userId);

    const socketUser = await User.findById(socket.userId);

    socket.on('disconnect', () => {
      console.log('User disconnected with session ID:', socket.id);
      const userId = socket.userId;
      socketUserMap.delete(userId);
      activeUsers.delete(userId);
      console.log('Active users:', activeUsers.size);
    });

    socket.on('message', async (data) => {
      try {
        const { to, body } = data;
        console.log('Message received:', { from: socket.userId, to, body });

        const recipientUser = await User.findOne({ username: to });
        if (!recipientUser) {
          console.error('Recipient user not found');
          return;
        }

        const newMessage = await Message.create({
          from: socket.userId,
          to: recipientUser._id,
          body:body
        });

        let interaction = await Interactions.findOne({user:socket.userId});

        if(!interaction){
          await Interactions.create({
            user:socket.userId,
            participants:[recipientUser._id]
          })
        }
        else {
          // If interaction exists, check if recipientUser._id is already in participants array
          if (!interaction.participants.includes(recipientUser._id)) {
            // If recipientUser._id is not already in participants array, push it
            interaction.participants.push(recipientUser._id);
            await interaction.save();
          }
        }

        interaction = await Interactions.findOne({user:recipientUser._id});

        if(!interaction){
          await Interactions.create({
            user:recipientUser._id,
            participants:[recipientUser._id]
          })
        }
        else {
          if (!interaction.participants.includes(socket.userId)) {
            interaction.participants.push(socket.userId);
            await interaction.save();
          }
        }

        const recipientSocketId = socketUserMap.get(recipientUser._id.toString());
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('message', { id:newMessage._id ,from: socketUser.username, body, to: recipientUser.username });
          console.log('Message sent to recipient');
        } else {
          console.log('Recipient not connected');
        }

      } catch (error) {
        console.error('Error sending message:', error);
      }
    });
  });
};

export { socket };
