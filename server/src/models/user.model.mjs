import mongoose, { Schema } from "mongoose";
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTF5-3YjBcXTqKUlOAeUUtuOLKgQSma2wGG1g&s",
    },
    bio: {
      type: String,
      default: "👋 Hey there!",
    },
    frozen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
export const User = mongoose.model("User", userSchema);
