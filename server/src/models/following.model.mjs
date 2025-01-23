import mongoose, { Schema } from "mongoose";
const followingSchema = new Schema({
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  followingId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
},{timestamps:true});
export const Following = mongoose.model("Following", followingSchema);
