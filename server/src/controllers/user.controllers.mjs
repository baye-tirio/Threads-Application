import { Following } from "../models/following.model.mjs";
import { Post } from "../models/post.model.mjs";
import { Repost } from "../models/repost.model.mjs";
import { User } from "../models/user.model.mjs";
import { errorHandler } from "../utils/errorHandler.mjs";
import bcryptjs from "bcryptjs";
import { didUserLike } from "../utils/didUserLike.mjs";
import { didUserRepost } from "../utils/didUserRepost.mjs";
import { didUserReply } from "../utils/didUserReply.mjs";
import { doesUserFollow, followCount } from "../utils/followingStatus.mjs";
import { uploadAvatar } from "../utils/uploadToCloudinary.mjs";
import { getInteractionsLikes } from "../utils/getInteractions.mjs";
import mongoose from "mongoose";

export const followUnfollowUser = async (req, res, next) => {
  try {
    const { userId: followedUser } = req.params;
    const findFollow = await Following.findOne({
      followerId: req.userId,
      followingId: followedUser,
    });
    if (!findFollow) {
      if (req.userId === followedUser)
        next(errorHandler(401, "unauthorized can't follow yourself!"));
      const following = new Following({
        followerId: req.userId,
        followingId: followedUser,
      });
      await following.save();
      res.status(201).json({
        success: true,
        message: "successfully followed!",
        following,
      });
    } else {
      await Following.deleteOne({
        followerId: req.userId,
        followingId: followedUser,
      });
      res.status(200).json({
        success: true,
        message: "successfully unfollowed!",
      });
    }
  } catch (error) {
    next(error);
  }
};
export const updateUser = async (req, res, next) => {
  try {
    let { profilePicture } = req.body;
    let { password } = req.body;
    if (password) password = bcryptjs.hashSync(password, 10);
    if (profilePicture) {
      //upload the profile picture to cloudinary then update the value of profilePicture to the cloudinary image url
      const result = await uploadAvatar(profilePicture, req.userId);
      profilePicture = result.secure_url;
    }
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          name: req.body.name,
          username: req.body.username,
          email: req.body.email,
          profilePicture,
          bio: req.body.bio,
          password,
        },
      },
      { new: true }
    ).select("-password");
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
export const getFeed = async (req, res, next) => {
  try {
    //load the people you follow
    const followees = await Following.find({ followerId: req.userId });
    const followeesIds = followees.map((followee) => followee.followingId);
    if (!followees) {
      res.status(200).json({
        success: true,
        feed: null,
      });
    } else {
      //logic for getting quotes , reposts and replies
      //basic posts I could do replies too but we gon keep it simple for now!
      let posts = await Post.find({
        postedBy: { $in: followeesIds },
        isAReply: false,
      }).sort({
        createdAt: -1,
      });
      posts = await Promise.all(
        posts.map(async (post) => {
          const userDetails = await User.findById(post.postedBy);
          const isLiked = await didUserLike(req.userId, post._id, next);
          const isReposted = await didUserRepost(req.userId, post._id, next);
          const isReplied = await didUserReply(req.userId, post._id, next);
          const interactionLikes = await getInteractionsLikes(
            post._id,
            req,
            res,
            next
          );
          return {
            ...post._doc,
            isLiked,
            isReposted,
            isReplied,
            userDetails,
            interactionLikes,
          };
        })
      );
      //logic to get the reposts....siku nyingine ii kitu complex

      res.status(200).json({
        success: true,
        feed: posts,
      });
    }
  } catch (error) {
    next(error);
  }
};
export const getProfilePosts = async (req, res, next) => {
  //get details and post
  const userDetails = await User.findById(req.params.userId);
  if (!userDetails) next(errorHandler(404, "User Not Found!"));
  else {
    // get posts
    let userPosts = await Post.find({ postedBy: userDetails._id });
    userPosts = await Promise.all(
      userPosts.map(async (post) => {
        const isLiked = await didUserLike(req.userId, post._id, next);
        const isReposted = await didUserRepost(req.userId, post._id, next);
        const isReplied = await didUserReply(req.userId, post._id, next);
        const interactionLikes = await getInteractionsLikes(
          post._id,
          req,
          res,
          next
        );
        return {
          ...post._doc,
          isLiked,
          isReposted,
          isReplied,
          interactionLikes,
        };
      })
    );
    //logic to get the reposts
    const userReposts = await Repost.find({ userId: userDetails._id });
    const userRepostsIds = userReposts.map((repost) => repost.postId);
    let repostedPosts = await Post.find({ _id: { $in: userRepostsIds } });
    repostedPosts = await Promise.all(
      repostedPosts.map(async (post) => {
        const repostedAt = userReposts.find(
          (repost) => repost.postId.toString() === post._id.toString()
        ).createdAt;
        // console.log("Reposted time");
        // console.log(repostedAt);
        const isLiked = await didUserLike(req.userId, post._id, next);
        const isReplied = await didUserReply(req.userId, post._id, next);
        const interactionLikes = await getInteractionsLikes(
          post._id,
          req,
          res,
          next
        );
        const userDetails = await User.findById(post.postedBy);
        return {
          ...post._doc,
          isLiked,
          isReposted: true,
          isReplied,
          isARepost: true,
          repostedAt,
          interactionLikes,
          userDetails,
        };
      })
    );
    //combining userPosts and reposted posts and sorting them based on the date in descending order
    const combined = userPosts.concat(repostedPosts);
    // console.log("The combined posts are : ");
    // console.log(combined);
    const sortedPosts = combined.sort((a, b) => {
      //   const dateA = a.repostedAt || a.createdAt;
      //   const dateB = b.respostedAt || b.createdAt;
      //   return dateB - dateA;
      let dateA, dateB;
      if (a.isARepost) dateA = a.repostedAt;
      else dateA = a.createdAt;
      if (b.isARepost) dateB = b.repostedAt;
      else dateB = b.createdAt;
      return dateB - dateA;
    });
    res.status(200).json({
      success: true,
      userPosts: sortedPosts,
    });
  }
  try {
  } catch (error) {
    next(error);
  }
};
export const getUserId = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user || user.frozen) next(errorHandler(404, "User Not found"));
    else {
      req.user = user;
      const { followersCount, followingCount } = await followCount(
        req,
        res,
        next
      );
      const isFollowing = await doesUserFollow(req, res, next);
      res.status(200).json({
        success: true,
        user: { ...user._doc, followersCount, followingCount, isFollowing },
      });
    }
  } catch (error) {
    next(error);
  }
};
export const getSuggestedUsers = async (req, res, next) => {
  try {
    //some logic to get suggested users but the result should also have the following status
    const followees = await Following.find({
      followerId: req.userId,
    });
    const followeesIds = followees.map((followee) => followee.followingId);
    // let users = await User.find({
    //   _id: {
    //     $nin: followeesIds,
    //     $ne: req.userId
    //   }
    // });
    const userId = new mongoose.Types.ObjectId(req.userId);
    console.log(userId);
    let users = await User.aggregate([
      {
        $match: {
          _id: {
            $nin: followeesIds,
            $ne: userId,
          },
        },
      },
      {
        $sample: {
          size: 4,
        },
      },
    ]);
    res.status(200).json({
      success: true,
      users: users,
    });
  } catch (error) {
    next(error);
  }
};
export const freezeAccount = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          frozen: true,
        },
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "successfully froze user",
      user: { ...updatedUser._doc, password: null },
    });
  } catch (error) {
    next(error);
  }
};
