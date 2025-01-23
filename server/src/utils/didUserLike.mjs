import { Like } from "../models/like.model.mjs";

export const didUserLike = async (userId, postId, next) => {
  try {
    const liked = await Like.exists({ userId, postId });
    return !!liked;
  } catch (error) {
    next(error);
  }
};
