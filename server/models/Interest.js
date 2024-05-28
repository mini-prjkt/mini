import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema.Types

const InterestSchema = new mongoose.Schema({
    name: { type: String, required: true , unique: true,},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});
const Interest = mongoose.model("Interest", InterestSchema);

export { Interest }; // Use named export