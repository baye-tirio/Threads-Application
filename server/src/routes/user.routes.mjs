import { Router } from "express";
import {
  followUnfollowUser,
  freezeAccount,
  getFeed,
  getProfilePosts,
  getSuggestedUsers,
  getUserId,
  updateUser,
} from "../controllers/user.controllers.mjs";
const router = Router();
router.patch("/update", updateUser);
router.get("/feed", getFeed);
router.post("/follow-unfollow/:userId", followUnfollowUser);
router.get("/profile-posts/:userId", getProfilePosts);
router.get("/userId/:username", getUserId);
router.get("/suggested-users", getSuggestedUsers);
router.patch("/freeze",freezeAccount)
export default router;
