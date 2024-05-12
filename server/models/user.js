import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    interests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interest' }]
});

const User = mongoose.model("User", UserSchema);

export { User }; // Use named export