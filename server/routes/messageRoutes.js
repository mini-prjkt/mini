import express from "express";
import { verifyToken } from "../middleware/userMiddleware.js";

import { readMessage , getInteractions} from "../controllers/MessageController.js";
const router = express.Router();

router.post("/read",verifyToken,(req,res)=>{
    readMessage(req,res);
});

router.get('/interactions',verifyToken,(req,res)=>{
    getInteractions(req,res);
});



export { router as MessageRouter };