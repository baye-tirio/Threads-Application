import { atom } from "recoil";

export const repliedPost = atom({
  key: "currentlyRenderedPost",
  default: {
    postId: null,
    post: null,
    replies: null,
  },
});
