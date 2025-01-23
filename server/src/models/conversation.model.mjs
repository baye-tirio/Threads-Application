import mongoose, { Schema } from "mongoose";
const conversationSchema = new Schema(
  {
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      required: true,
      maxLength: 2,
    },
    lastMessage: {
      type: {
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now(),
        },
        seen: {
          type: Boolean,
          default: false,
        },
      },
    },
  },
  { timestamps: true }
);
export const Conversation = mongoose.model("Conversation", conversationSchema);
