import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import http from 'http'
import cookieParser from 'cookie-parser'
dotenv.config()
import { UserRouter } from './routes/userRoutes.js'
import { MessageRouter } from './routes/messageRoutes.js'
import { socket } from './sockets/socket.js' 

const app = express()
const socketServer = http.createServer(app);
app.use(express.json())
app.use(cors({
    origin: ["http://localhost:3000","http://localhost.localdomain:3000"],
    credentials: true
}))
app.use(cookieParser())
app.use('/auth', UserRouter)
app.use('/chat',MessageRouter);

mongoose.connect('mongodb://localhost:27017/authentication')
socket(socketServer)

socketServer.listen(process.env.SOCKPORT, () => {             
    console.log('Socket hearing');
  });

app.listen(process.env.PORT, () => {
    console.log("Server Running")
})