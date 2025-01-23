import { atom } from "recoil";

export const profilePosts = atom({
  key: "profilePosts",
  default: {
    profileUser: null,
    userThread: null,
    userReplies: null,
  },
});
