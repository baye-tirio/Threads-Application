import { Like } from "../models/like.model.mjs";
import { Post } from "../models/post.model.mjs";
import { Repost } from "../models/repost.model.mjs";
import { didUserLike } from "../utils/didUserLike.mjs";
import { didUserReply } from "../utils/didUserReply.mjs";
import { didUserRepost } from "../utils/didUserRepost.mjs";
import {
  deletePostImageFromCloudinary,
  uploadPostImage,
} from "../utils/uploadToCloudinary.mjs";
import { errorHandler } from "../utils/errorHandler.mjs";
import { getInteractionsLikes } from "../utils/getInteractions.mjs";
import { User } from "../models/user.model.mjs";
//create a post
export const createPost = async (req, res, next) => {
  try {
    const { caption } = req.body;
    let { image } = req.body;
    if (image) {
      //upload the image to cloudinary
      const result = await uploadPostImage(image);
      image = result.secure_url;
    }
    //some payload validation if necessary
    const createdPost = new Post({ postedBy: req.userId, caption, image });
    await createdPost.save();
    res.status(201).json({
      success: true,
      post: {
        ...createdPost._doc,
        isLiked: false,
        isReposted: false,
        isReplied: false,
        interactionLikes: [],
      },
    });
  } catch (error) {
    next(error);
  }
};
//delete post
export const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const deletedPost = await Post.findOneAndDelete({
      postedBy: req.userId,
      _id: postId,
    });
    if (!deletedPost) next(errorHandler(404, "Unable to delete post"));
    else {
      //delete the post from the cloudinary database
      const deletionResult = await deletePostImageFromCloudinary(
        deletedPost.image
      );
      // if the post is a reply find the parent post and decrease it's repliesCount
      if (deletedPost.isAReply) {
        //we want to update the parent post replies count what's the logic?
        // while (parentPostId) {
        //   let parentPost = await Post.findByIdAndUpdate(
        //     parentPostId,
        //     {
        //       $inc: {
        //         repliesCount: -1,
        //       },
        //     },
        //     { new: true }
        //   );
        //   // If the condition below satisfies means we have another post whose replies count we have to update
        //   if (parentPost.isAReply) {
        //     parentPostId = parentPost.parentPost;
        //     parentPostIds.push(parentPostId);
        //   }
        //   // Else it means that this post has no parent post and thus no other post to update the replies count of
        //   else parentPostId = null;
        // }
        const parentPost = await Post.findByIdAndUpdate(
          deletedPost.parentPost,
          {
            $inc: {
              repliesCount: -1,
            },
            $pull: {
              replies: deletedPost._id,
            },
          },
          { new: true }
        );
        res.status(200).json({
          success: true,
          message: "successfully deleted post",
          //Think we should only return the deletedPost id and not the entire object we gon see tho
          deletedPost,
        });
      } else {
        res.status(200).json({
          success: true,
          message: "successfully deleted post",
          //Think we should only return the deletedPost id and not the entire object we gon see tho
          deletedPost,
        });
      }
    }
  } catch (error) {
    next(error);
  }
};
//view post details
export const viewPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    let post = await Post.findById(postId);
    if (!post) next(errorHandler(404, "Post Not Found!"));
    post = await {
      ...post._doc,
      userDetails: await User.findOne({ _id: post.postedBy }),
      isLiked: await didUserLike(req.userId, post._id, next),
      isReplied: await didUserReply(req.userId, post._id, next),
      isReposted: await didUserRepost(req.userId, post._id, next),
      interactionLikes: await getInteractionsLikes(postId, req, res, next),
    };
    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    next(error);
  }
};
//reply to a post
export const replyPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { caption, image } = req.body;
    //post a reply as a post
    const createdReply = new Post({
      postedBy: req.userId,
      caption,
      image,
      isAReply: true,
      parentPost: postId,
    });
    await createdReply.save();
    //update the post document in the post collection and update it's replies array
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          replies: createdReply._id,
        },
        $inc: {
          repliesCount: 1,
        },
      },
      { new: true }
    );
    if (!updatedPost) {
      next(errorHandler(404, "Post Not Found!"));
    } else {
      const repliedPost = await {
        ...updatedPost._doc,
        userDetails: await User.findOne({ _id: updatedPost.postedBy }),
        isLiked: await didUserLike(req.userId, updatedPost._id, next),
        isReplied: await didUserReply(req.userId, updatedPost._id, next),
        isReposted: await didUserRepost(req.userId, updatedPost._id, next),
        interactionLikes: await getInteractionsLikes(postId, req, res, next),
      };
      res.status(200).json({
        success: true,
        repliedPost,
        reply: {
          ...createdReply._doc,
          isLiked: false,
          isReposted: false,
          isReplied: false,
          interactionLikes: [],
        },
      });
    }
  } catch (error) {
    next(error);
  }
};
//get post replies
export const getReplies = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) next(errorHandler(404, "Post Not Found!"));
    else {
      const repliesIds = post.replies;
      let replies = await Post.find({ _id: { $in: repliesIds } }).sort({
        createdAt: -1,
      });
      replies = await Promise.all(
        replies.map(async (reply) => {
          const userDetails = await User.findOne({ _id: reply.postedBy });
          const isLiked = await didUserLike(req.userId, reply._id, next);
          const isReposted = await didUserRepost(req.userId, reply._id, next);
          const isReplied = await didUserReply(req.userId, reply._id, next);
          const interactionLikes = await getInteractionsLikes(
            reply._id,
            req,
            res,
            next
          );
          return {
            ...reply._doc,
            isLiked,
            isReposted,
            isReplied,
            interactionLikes,
            userDetails,
          };
        })
      );
      res.status(200).json({
        success: true,
        replies,
      });
    }
  } catch (error) {
    next(error);
  }
};
//repost
export const repostUnrepostPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    //check if a repost exists
    const findRepost = await Repost.findOne({ userId: req.userId, postId });
    if (findRepost) {
      await Repost.deleteOne({ userId: req.userId, postId });
      const unRepostedPost = await Post.findByIdAndUpdate(
        postId,
        {
          $inc: {
            repostsCount: -1,
          },
        },
        { new: true }
      );
      res.status(200).json({
        success: true,
        message: "Successfully unreposted",
        unRepostedPostId: unRepostedPost._id,
      });
    } else {
      const repost = new Repost({ userId: req.userId, postId });
      await repost.save();
      //increment the reposts count
      const repostedPost = await Post.findByIdAndUpdate(
        postId,
        {
          $inc: {
            repostsCount: 1,
          },
        },
        { new: true }
      );
      //let's look for the post and return it too
      const userDetails = await User.findById(repostedPost.postedBy);
      const repostedAt = repost.createdAt;
      const isLiked = await didUserLike(req.userId, repostedPost._id, next);
      const isReplied = await didUserReply(req.userId, repostedPost._id, next);
      const interactionLikes = await getInteractionsLikes(
        repostedPost._id,
        req,
        next
      );
      res.status(201).json({
        success: true,
        repost: {
          ...repostedPost._doc,
          isLiked,
          isReposted: true,
          isReplied,
          isARepost: true,
          repostedAt,
          interactionLikes,
          userDetails,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};
//like post
export const likeUnlikePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const findLike = await Like.findOne({ userId: req.userId, postId });
    if (!findLike) {
      const like = new Like({ userId: req.userId, postId });
      await like.save();
      //increment the likes count
      await Post.findByIdAndUpdate(postId, {
        $inc: {
          likesCount: 1,
        },
      });
      res.status(201).json({
        success: true,
        likedPost: like.postId,
      });
    } else {
      await Like.deleteOne({ userId: req.userId, postId });
      await Post.findByIdAndUpdate(postId, {
        $inc: {
          likesCount: -1,
        },
      });
      //might need a lo bit of optimization
      res.status(200).json({
        success: true,
        unlikedPost: postId,
        message: "Successfully unliked",
      });
    }
  } catch (error) {
    next(error);
  }
};
