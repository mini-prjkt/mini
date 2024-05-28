import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser'
dotenv.config()
import { UserRouter } from './routes/userRoutes.js'
import { MessageRouter } from './routes/messageRoutes.js'

const app = express()
app.use(express.json())
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}))
app.use(cookieParser())
app.use('/auth', UserRouter)
app.use('/chat',MessageRouter)

mongoose.connect('mongodb://localhost:27017/authentication')


app.listen(process.env.PORT, () => {
    console.log("Server is Running")
})