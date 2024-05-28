// post.model.js
import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    // Define post properties
    title: { type: String, required: true }, // Title of the post
    content: { type: String, required: true }, // Content of the post
    url: { type: String, required: true }, // URL of the post
    tag: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The author of the post
    createdAt: { type: Date, default: Date.now } // Creation date of the post
});

// Create Post model
const Post = mongoose.model("Post", PostSchema);

// Export Post model
export { Post };
