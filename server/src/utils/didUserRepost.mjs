import { Repost } from "../models/repost.model.mjs";

export const didUserRepost = async (userId, postId, next) => {
  try {
    const reposted = await Repost.exists({ userId, postId });
    return !!reposted;
  } catch (error) {
    next(error);
  }
};
