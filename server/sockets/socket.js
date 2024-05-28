import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Message } from '../models/Message.js'; 
import { User } from '../models/User.js'; 

const JWT_SECRET = 'jwttokenkey';

const socketUserMap = new Map(); 
const activeUsers = new Set(); 

const socket = async(socketServer)=>{
    const io = new Server(socketServer);

    io.use((socket, next) => {
        const authHeader = socket.handshake.headers['authorization'];
        
        if (!authHeader) {
            console.log('No authorization header provided');
            return next(new Error('Authentication error'));
        }

        const token = authHeader.split(' ')[1];
        
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
            socketUserMap.set(socket.userId, socket.id); // Bind socket ID and user ID
            activeUsers.add(socket.userId);
            next();
        });
    });

    io.on('connection', (socket) => {
        console.log('A user connected with session ID:', socket.id);
        console.log('User ID from token:', socket.userId);

        socket.on('disconnect', () => {
            console.log('User disconnected with session ID:', socket.id);
            const userId = socketUserMap.get(socket.id);
            socketUserMap.delete(socket.id);
            activeUsers.delete(userId); 
            console.log('Active users:', activeUsers.size); 
        });

        socket.on('message', async (data) => {
            try {
                const { to ,body } = data;

                
                const recipientUser = await User.findOne({ username: to });
                
                if (!recipientUser) {
                    console.error('Recipient user not found');
                    return;
                }

                const newMessage = await Message.create({
                    from: socket.userId,
                    to: recipientUser._id, 
                    body
                });

                for (const [userId, socketId] of socketUserMap.entries()) {
                    if (userId.toString() === recipientUser._id.toString()) {
                        console.log(userId);
                        io.to(socketId).emit('message', { from: socket.userId, body, to: recipientUser.username });
                        console.log("emit done")
                        break; // Exit the loop once the recipient is found and the message is sent
                    }
                }

            } catch (error) {
                console.error('Error sending message:', error);
            }
        });
    });
}

export {socket}
