import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    interests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interest' }], // Array of interests associated with the user
    country: { type: String },  
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }] // Array of posts authored by the user
});

const User = mongoose.model("User", UserSchema);

export { User };
