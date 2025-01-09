import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    interests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interest' }],
    country: { type: String },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  
    // Behavioral Data
    behavioralData: {
        typingSpeeds: [{ type: Number }],
        scrollSpeeds: [{ type: Number }],
        MessageLength: [{ type: Number }],
        PunctuationFrequency: [{ type: Number }],
        UppercaseRatio: [{ type: Number }], // NEW: Array for uppercase ratio
        LowercaseRatio: [{ type: Number }], // NEW: Array for lowercase ratio
      
        typingAverage: { type: Number, default: 0 },
        scrollAverage: { type: Number, default: 0 },
        MessageLengthAverage: { type: Number, default: 0 },
        PunctuationAverage: { type: Number, default: 0 },
        UppercaseAverage: { type: Number, default: 0 }, // NEW: Average uppercase ratio
        LowercaseAverage: { type: Number, default: 0 }, // NEW: Average lowercase ratio
      
        updatedAt: { type: Date, default: Date.now },
      },
  
    // ML Model Tracking
    retrainingRequired: { type: Boolean, default: false },
    profileScore: { type: Number, default: 0 },
  
    // Vector Embedding
    vector: [{ type: Number }],
  });
  
const User = mongoose.model("User", UserSchema);

export { User };
