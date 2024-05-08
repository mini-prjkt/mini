import mongoose from "mongoose";

const InterestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

export default mongoose.model("Interest", InterestSchema);
