import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Define schema for Conversation
const interactionsSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" }, // Foreign key reference to User model
  participants: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" }
    }
  ]
});

const Interactions = mongoose.model("Conversation", interactionsSchema);

export {Interactions};
