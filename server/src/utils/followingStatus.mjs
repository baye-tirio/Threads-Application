import { Following } from "../models/following.model.mjs";

export const doesUserFollow = async (req, res, next) => {
  try {
    const followingStatus = await Following.exists({
      followerId: req.userId,
      followingId: req.user._id,
    });
    return !!followingStatus;
  } catch (error) {
    next(error);
  }
};
export const followCount = async (req, res, next) => {
  try {
    const followersCount = await Following.countDocuments({
      followingId: req.user._id,
    });
    // console.log("followers count", followersCount);
    const followingCount = await Following.countDocuments({
      followerId: req.user._id,
    });
    // console.log("following count", followingCount);
    return { followersCount, followingCount };
  } catch (error) {
    next(error);
  }
};
