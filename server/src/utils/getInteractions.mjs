import { Following } from "../models/following.model.mjs";
import { Like } from "../models/like.model.mjs";
import { User } from "../models/user.model.mjs";

export const getInteractionsLikes = async (postId,req, res, next) => {
  try {
    //load the people you follow
    const followees = await Following.find({ followerId: req.userId });
    const followeesIds = followees.map((followee) => followee.followingId);
    // console.log("Users followed");
    // console.log(followeesIds);
    const likes = await Like.find({
      userId: { $in: followeesIds },
      postId,
    });
    const likesIds = likes.map((like) => like.userId);
    //userProfiles
    const interactions = await User.find({ _id: { $in: likesIds } }).select(
      "profilePicture"
    ).select("username");
    // console.log("Profile pictures of the people who liked the post");
    // console.log(interactions);
    return interactions;
  } catch (error) {
    console.log(error);
    next(error)
  }
};
