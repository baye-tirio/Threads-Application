import { Post } from "../models/post.model.mjs";

export const didUserReply = async (userId, postId, next) => {
  try {
    const post = await Post.findById(postId);
    const repliesIds = post.replies;
    return repliesIds.includes(userId);
  } catch (error) {
    next(error);
  }
};
