import mongoose from "mongoose";

const InterestSchema = new mongoose.Schema({
    name: { type: String, required: true }
});

const Interest = mongoose.model("Interest", InterestSchema);

export { Interest }; // Use named export