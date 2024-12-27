import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    interests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interest' }], // Array of interests associated with the user
    country: { type: String },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // Array of posts authored by the user

    // Behavioral Data
    behavioralData: {
        typingSpeeds: [{ type: Number }], // Array of typing speeds (ms/keystroke)
        scrollSpeeds: [{ type: Number }], // Array of scroll speeds (px/ms)
        typingAverage: { type: Number, default: 0 }, // Average typing speed
        scrollAverage: { type: Number, default: 0 }, // Average scroll speed
        updatedAt: { type: Date, default: Date.now } // Timestamp of the last behavioral update
    },

    // ML Model Tracking
    retrainingRequired: { type: Boolean, default: false }, // Indicates if user model requires retraining
    profileScore: { type: Number, default: 0 }, // A score indicating the user's behavioral profile quality

    // Vector Embedding
    vector: [{ type: Number }] // Array to store embeddings: [average typing, average scrolling, latest typing, latest scrolling]
});

const User = mongoose.model("User", UserSchema);

export { User };
