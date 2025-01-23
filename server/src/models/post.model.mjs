import mongoose, { Schema } from "mongoose";
const postSchema = new Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    caption: {
      type: String,
      maxLength: 500,
    },
    image: {
      type: String,
    },
    //The only knock on this is we probably might have a limit on how big a document can be.
    replies: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
      default: [],
    },
    isAReply: {
      type: Boolean,
      default: false,
    },
    parentPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    repliesCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    repostsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
export const Post = mongoose.model("Post", postSchema);
