import { Router } from "express";
import {
  createPost,
  deletePost,
  getReplies,
  likeUnlikePost,
  replyPost,
  repostUnrepostPost,
  viewPost,
} from "../controllers/post.controllers.mjs";
const router = Router();
router.post("/create-post", createPost);
router.delete("/delete/:postId", deletePost);
router.get("/replies/:postId", getReplies);
router.post("/reply/:postId", replyPost);
router.post("/like-unlike/:postId", likeUnlikePost);
router.post("/repost-unrepost/:postId", repostUnrepostPost);
router.get("/:postId", viewPost);
export default router;
