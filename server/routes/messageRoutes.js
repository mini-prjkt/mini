import express from "express";
import { verifyToken } from "../middleware/userMiddleware.js";
import { createMessage , deleteMessage, readMessage } from "../controllers/MessageController.js";
const router = express.Router();

router.post("/message",verifyToken,(req,res)=>{
    createMessage(req,res);
});

router.post("/read",verifyToken,(req,res)=>{
    readMessage(req,res);
});

router.post("/delete",verifyToken,(req,res)=>{
    deleteMessage(req,res);
});

export { router as MessageRouter };