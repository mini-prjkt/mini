import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Define schema for Interactions
const interactionsSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" }, // Foreign key reference to User model
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }] // Array of ObjectId references to User model
});

const Interactions = mongoose.model("Interactions", interactionsSchema);

export { Interactions };
