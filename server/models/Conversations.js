const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    participants:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }],

    lastMessage:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Message',
        required:true
    }
});

const Conversation = mongoose.model("Conversation",ConversationSchema);
export {Conversation};